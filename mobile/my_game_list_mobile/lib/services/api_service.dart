import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart'; // ADD THIS IMPORT

class ApiService {
  static const String _baseUrl = 'https://playedit.games/api/auth';

  static Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/login'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'email': username,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print("LOGIN RESPONSE: $data");
      
      // SAVE THE TOKEN
      if (data['token'] != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        print("✅ Token saved successfully: ${data['token']}");
      }
      
      return data;

    } else if (response.statusCode == 403) {
      // Handle email not verified case
      final data = jsonDecode(response.body);
      print("Failed with status: ${response.statusCode}");
      print("Error response body: ${response.body}");
      throw Exception(data['message'] ?? 'Email not verified');
      
    } else {
      print("Failed with status: ${response.statusCode}");
      print("Error response body: ${response.body}");
      throw Exception('Failed to login');
    }
  }

  static Future<Map<String, dynamic>> register(Map<String, String> userData) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/register'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(userData),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to register');
    }
  }

  /*static Future<Map<String, dynamic>> updateProfile(Map<String, String> userData) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/user/profile'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(userData),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update profile');
    }
  }*/

  static Future<Map<String, dynamic>> updateProfile(Map<String, String> userData) async {
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');
    
    if (token == null || token.isEmpty) {
      throw Exception('No authentication token found. Please log in again.');
    }

    final response = await http.patch(
      Uri.parse('https://playedit.games/api/user/profile'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(userData),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update profile: ${response.statusCode} - ${response.body}');
    }
  }
}