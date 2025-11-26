// lib/models/auth_response.dart
class AuthResponse {
  final String token;
  final String refreshToken;
  final User user;
  
  AuthResponse({
    required this.token,
    required this.refreshToken,
    required this.user,
  });
  
  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'],
      refreshToken: json['refreshToken'],
      user: User.fromJson(json['user']),
    );
  }
}

// lib/models/student.dart
class Student {
  final String id;
  final String studentCode;
  final String fullName;
  final String email;
  final String major;
  final double? gpa;
  final List<String>? skills;
  
  Student({
    required this.id,
    required this.studentCode,
    required this.fullName,
    required this.email,
    required this.major,
    this.gpa,
    this.skills,
  });
  
  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id'],
      studentCode: json['studentCode'],
      fullName: json['fullName'],
      email: json['email'],
      major: json['major'],
      gpa: json['gpa']?.toDouble(),
      skills: (json['skills'] as List?)?.cast<String>(),
    );
  }
}

// lib/models/group.dart
class Group {
  final String id;
  final String groupName;
  final String groupCode;
  final String? leaderId;
  final int currentMembers;
  final int maxMembers;
  final String status;
  final List<GroupMember>? members;
  
  Group({
    required this.id,
    required this.groupName,
    required this.groupCode,
    this.leaderId,
    required this.currentMembers,
    required this.maxMembers,
    required this.status,
    this.members,
  });
  
  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
      id: json['id'],
      groupName: json['groupName'],
      groupCode: json['groupCode'],
      leaderId: json['leaderId'],
      currentMembers: json['currentMembers'],
      maxMembers: json['maxMembers'],
      status: json['status'],
      members: (json['members'] as List?)
          ?.map((m) => GroupMember.fromJson(m))
          .toList(),
    );
  }
}