// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api'; // Proxy URL
  
  String? _authToken;
  
  // Set auth token after login
  void setAuthToken(String token) {
    _authToken = token;
  }
  
  Map<String, String> get _headers {
    final headers = {
      'Content-Type': 'application/json',
    };
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }
  
  // Authentication
  Future<AuthResponse> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _authToken = data['token'];
      return AuthResponse.fromJson(data);
    } else {
      throw ApiException(response.statusCode, response.body);
    }
  }
  
  // Students
  Future<List<Student>> getStudents({
    int? page,
    int? limit,
    String? major,
    String? search,
  }) async {
    final queryParams = <String, String>{};
    if (page != null) queryParams['page'] = page.toString();
    if (limit != null) queryParams['limit'] = limit.toString();
    if (major != null) queryParams['major'] = major;
    if (search != null) queryParams['search'] = search;
    
    final uri = Uri.parse('$baseUrl/students').replace(
      queryParameters: queryParams.isEmpty ? null : queryParams,
    );
    
    final response = await http.get(uri, headers: _headers);
    
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Student.fromJson(json)).toList();
    } else {
      throw ApiException(response.statusCode, response.body);
    }
  }
  
  Future<Student> getStudentById(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/students/$id'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return Student.fromJson(jsonDecode(response.body));
    } else {
      throw ApiException(response.statusCode, response.body);
    }
  }
  
  // Groups
  Future<List<Group>> getGroups({String? courseId}) async {
    final queryParams = courseId != null ? {'courseId': courseId} : null;
    final uri = Uri.parse('$baseUrl/groups').replace(
      queryParameters: queryParams,
    );
    
    final response = await http.get(uri, headers: _headers);
    
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Group.fromJson(json)).toList();
    } else {
      throw ApiException(response.statusCode, response.body);
    }
  }
  
  Future<Group> createGroup(CreateGroupRequest request) async {
    final response = await http.post(
      Uri.parse('$baseUrl/groups'),
      headers: _headers,
      body: jsonEncode(request.toJson()),
    );
    
    if (response.statusCode == 201) {
      return Group.fromJson(jsonDecode(response.body));
    } else {
      throw ApiException(response.statusCode, response.body);
    }
  }
  
  Future<void> joinGroup(String groupId, String studentId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/groups/$groupId/members'),
      headers: _headers,
      body: jsonEncode({'studentId': studentId}),
    );
    
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw ApiException(response.statusCode, response.body);
    }
  }
  
  // Recommendations
  Future<List<GroupRecommendation>> getRecommendations(String studentId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/recommendations?studentId=$studentId'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => GroupRecommendation.fromJson(json)).toList();
    } else {
      throw ApiException(response.statusCode, response.body);
    }
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;
  
  ApiException(this.statusCode, this.message);
  
  @override
  String toString() => 'ApiException($statusCode): $message';
}