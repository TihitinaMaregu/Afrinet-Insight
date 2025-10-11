"""
BigQuery client for fetching Measurement Lab internet performance data
"""
from google.cloud import bigquery
from datetime import datetime, timedelta
import os

class BigQueryClient:
    def __init__(self):
        """Initialize BigQuery client"""
        self.client = bigquery.Client()
        self.project_id = "measurement-lab"
        self.dataset_id = "ndt"
        self.table_id = "unified_downloads"
        
    def get_country_overview(self, start_date=None, end_date=None):
        """
        Get average download speeds for all African countries
        
        Args:
            start_date: Start date for filtering (YYYY-MM-DD)
            end_date: End date for filtering (YYYY-MM-DD)
            
        Returns:
            List of dictionaries with country data
        """
        if not start_date:
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
            
        query = f"""
        SELECT 
            client.Geo.CountryCode as country_code,
            client.Geo.CountryName as country_name,
            AVG(a.MeanThroughputMbps) as avg_download_speed,
            AVG(a.MinRTT) as avg_latency,
            COUNT(*) as test_count,
            AVG(CASE WHEN a.LossRate > 0 THEN a.LossRate ELSE 0 END) as avg_packet_loss
        FROM 
            `{self.project_id}.{self.dataset_id}.{self.table_id}` a
        WHERE 
            date BETWEEN '{start_date}' AND '{end_date}'
            AND client.Geo.ContinentCode = 'AF'
            AND a.MeanThroughputMbps IS NOT NULL
            AND a.MeanThroughputMbps > 0
        GROUP BY 
            country_code, country_name
        ORDER BY 
            avg_download_speed DESC
        LIMIT 100
        """
        
        query_job = self.client.query(query)
        results = query_job.result()
        
        return [dict(row) for row in results]
    
    def get_country_data(self, country_code, start_date=None, end_date=None):
        """
        Get detailed data for a specific country including cities and ISPs
        
        Args:
            country_code: ISO country code (e.g., 'ZA' for South Africa)
            start_date: Start date for filtering (YYYY-MM-DD)
            end_date: End date for filtering (YYYY-MM-DD)
            
        Returns:
            Dictionary with country statistics
        """
        if not start_date:
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
            
        query = f"""
        SELECT 
            client.Geo.City as city,
            client.Network.ASName as isp,
            AVG(a.MeanThroughputMbps) as avg_download_speed,
            AVG(a.MinRTT) as avg_latency,
            COUNT(*) as test_count,
            AVG(CASE WHEN a.LossRate > 0 THEN a.LossRate ELSE 0 END) as avg_packet_loss
        FROM 
            `{self.project_id}.{self.dataset_id}.{self.table_id}` a
        WHERE 
            date BETWEEN '{start_date}' AND '{end_date}'
            AND client.Geo.CountryCode = '{country_code}'
            AND a.MeanThroughputMbps IS NOT NULL
            AND a.MeanThroughputMbps > 0
        GROUP BY 
            city, isp
        HAVING 
            test_count > 10
        ORDER BY 
            avg_download_speed DESC
        LIMIT 200
        """
        
        query_job = self.client.query(query)
        results = query_job.result()
        
        return [dict(row) for row in results]
    
    def get_time_series(self, country_code=None, city=None, isp=None, start_date=None, end_date=None):
        """
        Get time series data for trend analysis
        
        Args:
            country_code: ISO country code (optional)
            city: City name (optional)
            isp: ISP name (optional)
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            
        Returns:
            List of time series data points
        """
        if not start_date:
            start_date = (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
            
        where_clauses = [
            f"date BETWEEN '{start_date}' AND '{end_date}'",
            "a.MeanThroughputMbps IS NOT NULL",
            "a.MeanThroughputMbps > 0"
        ]
        
        if country_code:
            where_clauses.append(f"client.Geo.CountryCode = '{country_code}'")
        else:
            where_clauses.append("client.Geo.ContinentCode = 'AF'")
            
        if city:
            where_clauses.append(f"client.Geo.City = '{city}'")
            
        if isp:
            where_clauses.append(f"client.Network.ASName = '{isp}'")
            
        where_clause = " AND ".join(where_clauses)
        
        query = f"""
        SELECT 
            DATE_TRUNC(date, WEEK) as week,
            AVG(a.MeanThroughputMbps) as avg_download_speed,
            AVG(a.MinRTT) as avg_latency,
            COUNT(*) as test_count,
            AVG(CASE WHEN a.LossRate > 0 THEN a.LossRate ELSE 0 END) as avg_packet_loss
        FROM 
            `{self.project_id}.{self.dataset_id}.{self.table_id}` a
        WHERE 
            {where_clause}
        GROUP BY 
            week
        ORDER BY 
            week ASC
        LIMIT 500
        """
        
        query_job = self.client.query(query)
        results = query_job.result()
        
        data = []
        for row in results:
            row_dict = dict(row)
            # Convert date to string for JSON serialization
            if 'week' in row_dict and row_dict['week']:
                row_dict['week'] = row_dict['week'].isoformat()
            data.append(row_dict)
            
        return data
    
    def get_cities_for_country(self, country_code, start_date=None, end_date=None):
        """
        Get list of cities with data for a specific country
        
        Args:
            country_code: ISO country code
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            
        Returns:
            List of cities with their average speeds
        """
        if not start_date:
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
            
        query = f"""
        SELECT 
            client.Geo.City as city,
            AVG(a.MeanThroughputMbps) as avg_download_speed,
            COUNT(*) as test_count
        FROM 
            `{self.project_id}.{self.dataset_id}.{self.table_id}` a
        WHERE 
            date BETWEEN '{start_date}' AND '{end_date}'
            AND client.Geo.CountryCode = '{country_code}'
            AND client.Geo.City IS NOT NULL
            AND a.MeanThroughputMbps IS NOT NULL
            AND a.MeanThroughputMbps > 0
        GROUP BY 
            city
        HAVING 
            test_count > 50
        ORDER BY 
            avg_download_speed DESC
        LIMIT 100
        """
        
        query_job = self.client.query(query)
        results = query_job.result()
        
        return [dict(row) for row in results]
    
    def get_isps_for_location(self, country_code, city=None, start_date=None, end_date=None):
        """
        Get list of ISPs for a specific location
        
        Args:
            country_code: ISO country code
            city: City name (optional)
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            
        Returns:
            List of ISPs with their performance metrics
        """
        if not start_date:
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
            
        where_clauses = [
            f"date BETWEEN '{start_date}' AND '{end_date}'",
            f"client.Geo.CountryCode = '{country_code}'",
            "client.Network.ASName IS NOT NULL",
            "a.MeanThroughputMbps IS NOT NULL",
            "a.MeanThroughputMbps > 0"
        ]
        
        if city:
            where_clauses.append(f"client.Geo.City = '{city}'")
            
        where_clause = " AND ".join(where_clauses)
        
        query = f"""
        SELECT 
            client.Network.ASName as isp,
            AVG(a.MeanThroughputMbps) as avg_download_speed,
            AVG(a.MinRTT) as avg_latency,
            COUNT(*) as test_count,
            AVG(CASE WHEN a.LossRate > 0 THEN a.LossRate ELSE 0 END) as avg_packet_loss
        FROM 
            `{self.project_id}.{self.dataset_id}.{self.table_id}` a
        WHERE 
            {where_clause}
        GROUP BY 
            isp
        HAVING 
            test_count > 20
        ORDER BY 
            avg_download_speed DESC
        LIMIT 50
        """
        
        query_job = self.client.query(query)
        results = query_job.result()
        
        return [dict(row) for row in results]
    
    def compare_isps(self, country_code, city, isp_list, start_date=None, end_date=None):
        """
        Compare multiple ISPs in a specific city
        
        Args:
            country_code: ISO country code
            city: City name
            isp_list: List of ISP names to compare
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            
        Returns:
            Comparison data for the specified ISPs
        """
        if not start_date:
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
            
        # Create ISP filter
        isp_filter = "(" + " OR ".join([f"client.Network.ASName = '{isp}'" for isp in isp_list]) + ")"
        
        query = f"""
        SELECT 
            client.Network.ASName as isp,
            AVG(a.MeanThroughputMbps) as avg_download_speed,
            AVG(a.MinRTT) as avg_latency,
            COUNT(*) as test_count,
            AVG(CASE WHEN a.LossRate > 0 THEN a.LossRate ELSE 0 END) as avg_packet_loss,
            APPROX_QUANTILES(a.MeanThroughputMbps, 100)[OFFSET(50)] as median_download_speed,
            APPROX_QUANTILES(a.MeanThroughputMbps, 100)[OFFSET(95)] as p95_download_speed
        FROM 
            `{self.project_id}.{self.dataset_id}.{self.table_id}` a
        WHERE 
            date BETWEEN '{start_date}' AND '{end_date}'
            AND client.Geo.CountryCode = '{country_code}'
            AND client.Geo.City = '{city}'
            AND {isp_filter}
            AND a.MeanThroughputMbps IS NOT NULL
            AND a.MeanThroughputMbps > 0
        GROUP BY 
            isp
        ORDER BY 
            avg_download_speed DESC
        """
        
        query_job = self.client.query(query)
        results = query_job.result()
        
        return [dict(row) for row in results]
