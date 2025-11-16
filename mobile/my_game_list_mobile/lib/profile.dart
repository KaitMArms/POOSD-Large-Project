import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:my_game_list_mobile/AddGames.dart';
import 'package:my_game_list_mobile/listCreator.dart';
import 'package:my_game_list_mobile/user_details.dart';
import 'package:my_game_list_mobile/log_out.dart';
import 'package:my_game_list_mobile/notifications.dart';
import 'package:my_game_list_mobile/services/api_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart'; // ADD THIS // ADD THIS

// User Profile Model Class
class UserProfile {
  final String firstName;
  final String lastName;
  final String username;
  final String email;
  final String? avatarUrl;
  final String? bio;
  final String role;
  
  UserProfile({
    required this.firstName,
    required this.lastName,
    required this.username,
    required this.email,
    this.avatarUrl,
    this.bio,
    required this.role,
  });

  // Convert to Map if needed
  Map<String, String?> toMap() {
    return {
      'firstName': firstName,
      'lastName': lastName,
      'username': username,
      'email': email,
      'avatarUrl': avatarUrl,
      'bio': bio,
      'role': role,
    };
  }
  
  // Create UserProfile from JSON
  factory UserProfile.fromJSON(Map<String, dynamic> json) {
    return UserProfile(
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      avatarUrl: json['avatarUrl'],
      bio: json['bio'],
      role: json['role'] ?? 'user',
    );
  }

  // Helper getter for full name
  String get fullName => '$firstName $lastName';
}

// Profile Widget
class Profile extends StatefulWidget {
  const Profile({super.key});

  @override
  State<Profile> createState() => _ProfileState();
}

class _ProfileState extends State<Profile> {
  // State variables
  UserProfile? userProfile;
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    loadProfile();
  }

  // Fetch user profile from API
  Future<void> loadProfile() async {
    try {
      // Get the saved JWT token from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      // Check if token exists
      if (token == null || token.isEmpty) {
        setState(() {
          errorMessage = 'Please log in';
          isLoading = false;
        });
        return;
      }
      
      final profile = await fetchUserProfile(token);
      
      setState(() {
        userProfile = profile;
        isLoading = false;
      });
    } catch (e) {
      print('Error loading profile: $e');
      setState(() {
        errorMessage = 'Failed to load profile';
        isLoading = false;
      });
    }
  }

  // API call function
  Future<UserProfile> fetchUserProfile(String token) async {
    final uri = Uri.parse('https://playedit.games/api/user/profile');
    
    final response = await http.get(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return UserProfile.fromJSON(data['user']);
    } else {
      throw Exception("Failed to fetch user profile: ${response.statusCode}");
    }
  }

  @override
  Widget build(BuildContext context) {
    // Show loading spinner while fetching data
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          elevation: 0,
          backgroundColor: Colors.transparent,
          title: const Text("Profile"),
          centerTitle: true,
        ),
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    // Show error message if loading failed
    if (errorMessage != null) {
      return Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          elevation: 0,
          backgroundColor: Colors.transparent,
          title: const Text("Profile"),
          centerTitle: true,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(errorMessage!),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    isLoading = true;
                    errorMessage = null;
                  });
                  loadProfile();
                },
                child: Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    // Main profile UI (only shows when data is loaded)
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 0,
        backgroundColor: Colors.transparent,
        title: const Text("Profile"),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: () {}, 
            icon: Icon(MdiIcons.accountSettings),
          )
        ],
      ),
      body: ListView(
        padding: EdgeInsets.symmetric(horizontal: 20),
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Profile Picture
              GestureDetector(
                onTap: profileAction,
                child: CircleAvatar(
                  radius: 50,
                  backgroundImage: userProfile?.avatarUrl != null
                      ? NetworkImage('https://playedit.games${userProfile!.avatarUrl}')
                      : AssetImage("assets/Mascot.png") as ImageProvider,
                ),
              ),
              SizedBox(height: 10),
              
              // User's Full Name
              Text(
                userProfile?.fullName ?? 'Loading...',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              
              // User's Email or Bio
              Text(
                userProfile?.email ?? '',
                style: TextStyle(color: Colors.grey),
              ),
              
              const SizedBox(height: 25),
              
              // Complete Your Profile Section
              Row(
                children: const [
                  Padding(
                    padding: EdgeInsets.only(right: 5),
                    child: Text(
                      "Complete Your Profile",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Text("(1/3)"),
                ],
              ),
              
              SizedBox(height: 10),
              
              // Progress Indicator
              Row(
                children: List.generate(3, (index) {
                  return Expanded(
                    child: Container(
                      height: 7,
                      margin: EdgeInsets.only(right: index == 2 ? 0 : 6),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: index == 0 ? Colors.blue : Colors.black38,
                      ),
                    ),
                  );
                }),
              ),
              
              const SizedBox(height: 30),
              
              // Profile Completion Cards
              SizedBox(
                height: 170,
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const BouncingScrollPhysics(),
                  scrollDirection: Axis.horizontal,
                  itemBuilder: (context, index) {
                    final card = profileCompletionCards[index];
                    return SizedBox(
                      width: 160,
                      child: Card(
                        shadowColor: Colors.black12,
                        child: Padding(
                          padding: const EdgeInsets.all(15.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Icon(
                                card.icon,
                                size: 30,
                              ),
                              SizedBox(height: 10),
                              Text(
                                card.title,
                                textAlign: TextAlign.center,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Spacer(),
                              ElevatedButton(
                                onPressed: () {
                                  if (card.page != null) {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => card.page!),
                                    );
                                  }
                                }, 
                                style: ElevatedButton.styleFrom(
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  )
                                ),
                                child: Text(card.buttonText),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }, 
                  separatorBuilder: (context, index) => Padding(
                    padding: EdgeInsets.only(right: 5)
                  ), 
                  itemCount: profileCompletionCards.length,
                ),
              ),
              
              SizedBox(height: 30),
              
              // Settings List Tiles
              ...List.generate(
                customListTiles.length, 
                (index) {
                  final tile = customListTiles[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 5.0),
                    child: Card(
                      elevation: 4,
                      shadowColor: Colors.black12,
                      child: ListTile(
                        title: Text(tile.title),
                        leading: Icon(tile.icon),
                        trailing: Icon(Icons.chevron_right),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => tile.page,
                            )
                          );
                        },
                      ),
                    ),
                  );
                }
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Profile picture action (upload/change avatar)
  Future<void> profileAction() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image == null) return;
    
    // TODO: Upload image to your backend
    // You'll need to implement the upload logic here
    print('Image selected: ${image.path}');
  }
}

// Profile Completion Card Model
class ProfileCompletionCard {
  final String title;
  final String buttonText;
  final IconData icon;
  final Widget? page;

  ProfileCompletionCard({
    required this.title,
    required this.buttonText,
    required this.icon,
    this.page,
  });
}

// Profile Completion Cards List
List<ProfileCompletionCard> profileCompletionCards = [
  ProfileCompletionCard(
    title: "Set Your Profile Details",
    buttonText: "Continue",
    icon: CupertinoIcons.person_circle,
    page: UserDetails(),
  ),
  ProfileCompletionCard(
    title: "Manage Your Games",
    buttonText: "Continue",
    icon: CupertinoIcons.square_list,
    page: ListCreator(),
  ),
  ProfileCompletionCard(
    title: "Find More Games",
    buttonText: "Add",
    icon: CupertinoIcons.game_controller,
    page: AddGames(),
  ),
];

// Custom List Tile Model
class CustomListTiles {
  final IconData icon;
  final String title;
  final Widget page;
  
  CustomListTiles({
    required this.icon,
    required this.title,
    required this.page,
  });
}

// Custom List Tiles
List<CustomListTiles> customListTiles = [
  CustomListTiles(
    icon: CupertinoIcons.bell, 
    title: "Notifications", 
    page: Notifications(),
  ),
  CustomListTiles(
    icon: CupertinoIcons.arrow_right_arrow_left, 
    title: "Logout", 
    page: LogOut(),
  ),
];