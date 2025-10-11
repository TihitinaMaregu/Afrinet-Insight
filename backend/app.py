"""
Flask API for Afrinet Insight Dashboard
Provides endpoints to query Measurement Lab data from BigQuery
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from bigquery_client import BigQueryClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize BigQuery client
bq_client = BigQueryClient()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "afrinet-insight-api"})

@app.route('/api/countries', methods=['GET'])
def get_countries():
    """
    Get overview of all African countries with average speeds
    Query params: start_date, end_date (YYYY-MM-DD format)
    """
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        data = bq_client.get_country_overview(start_date, end_date)
        return jsonify({
            "success": True,
            "data": data,
            "count": len(data)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/country/<country_code>', methods=['GET'])
def get_country_details(country_code):
    """
    Get detailed data for a specific country
    Query params: start_date, end_date (YYYY-MM-DD format)
    """
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        data = bq_client.get_country_data(country_code, start_date, end_date)
        return jsonify({
            "success": True,
            "country_code": country_code,
            "data": data,
            "count": len(data)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/cities/<country_code>', methods=['GET'])
def get_cities(country_code):
    """
    Get list of cities for a specific country
    Query params: start_date, end_date (YYYY-MM-DD format)
    """
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        data = bq_client.get_cities_for_country(country_code, start_date, end_date)
        return jsonify({
            "success": True,
            "country_code": country_code,
            "cities": data,
            "count": len(data)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/isps/<country_code>', methods=['GET'])
def get_isps(country_code):
    """
    Get list of ISPs for a specific country/city
    Query params: city, start_date, end_date (YYYY-MM-DD format)
    """
    try:
        city = request.args.get('city')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        data = bq_client.get_isps_for_location(country_code, city, start_date, end_date)
        return jsonify({
            "success": True,
            "country_code": country_code,
            "city": city,
            "isps": data,
            "count": len(data)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/timeseries', methods=['GET'])
def get_timeseries():
    """
    Get time series data for trend analysis
    Query params: country_code, city, isp, start_date, end_date (YYYY-MM-DD format)
    """
    try:
        country_code = request.args.get('country_code')
        city = request.args.get('city')
        isp = request.args.get('isp')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        data = bq_client.get_time_series(country_code, city, isp, start_date, end_date)
        return jsonify({
            "success": True,
            "filters": {
                "country_code": country_code,
                "city": city,
                "isp": isp,
                "start_date": start_date,
                "end_date": end_date
            },
            "data": data,
            "count": len(data)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/compare-isps', methods=['POST'])
def compare_isps():
    """
    Compare multiple ISPs in a specific city
    Request body: {
        "country_code": "ZA",
        "city": "Cape Town",
        "isps": ["Vodacom", "MTN", "AfriHos"],
        "start_date": "2024-01-01",
        "end_date": "2024-07-31"
    }
    """
    try:
        data = request.get_json()
        country_code = data.get('country_code')
        city = data.get('city')
        isps = data.get('isps', [])
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not country_code or not city or not isps:
            return jsonify({
                "success": False,
                "error": "country_code, city, and isps are required"
            }), 400
        
        comparison_data = bq_client.compare_isps(country_code, city, isps, start_date, end_date)
        return jsonify({
            "success": True,
            "comparison": {
                "country_code": country_code,
                "city": city,
                "isps": isps
            },
            "data": comparison_data,
            "count": len(comparison_data)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
