// lib/screens/groups_screen.dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/group.dart';

class GroupsScreen extends StatefulWidget {
  @override
  _GroupsScreenState createState() => _GroupsScreenState();
}

class _GroupsScreenState extends State<GroupsScreen> {
  final ApiService _apiService = ApiService();
  List<Group>? _groups;
  bool _isLoading = true;
  String? _error;
  
  @override
  void initState() {
    super.initState();
    _loadGroups();
  }
  
  Future<void> _loadGroups() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    
    try {
      final groups = await _apiService.getGroups();
      setState(() {
        _groups = groups;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $_error'),
            ElevatedButton(
              onPressed: _loadGroups,
              child: Text('Retry'),
            ),
          ],
        ),
      );
    }
    
    return ListView.builder(
      itemCount: _groups?.length ?? 0,
      itemBuilder: (context, index) {
        final group = _groups![index];
        return GroupCard(group: group);
      },
    );
  }
}