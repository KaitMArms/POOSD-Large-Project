import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
class Profile extends StatefulWidget {
  const Profile({super.key});

  @override
  State<Profile> createState() => _ProfileState();

}
class _ProfileState extends State<Profile> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        title: const Text("Profile"),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: () {}, 
            icon: Icon(MdiIcons.accountSettings) 
          )
        ],
      ),
      body: ListView(
        padding: EdgeInsets.symmetric(horizontal: 20),
        children:  [
          Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 50,
                backgroundImage: AssetImage("assets/Mascot.png"),
              ),
              SizedBox(height: 10),
              Text(
                "Connect Name API from Log-In Here",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                "Connect Number of Games Committed Here (Possibly if Not for Your Data Part, either that or email API too)"
              ),
              const SizedBox(height: 25),
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
                  Text("(1/5)"),
                ],
              ),

              SizedBox(height: 10),
              Row(
                children: List.generate(5, (index) {
                  return Expanded(
                    child: Container(
                      height: 7,
                      width: 10,
                      margin: EdgeInsets.only(right: index == 4 ? 0 : 6),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: index == 0 ? Colors.blue : Colors.black38,
                      ),
                    ),
                  );
                },),
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 160,
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
                              ElevatedButton(onPressed: () {
                              }, 
                              style: ElevatedButton.styleFrom(
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                )
                              ),
                              child: Text(card.buttonText)),
                            ],
                          ),
                        ),
                      ),
                    );
                  }, 
                  separatorBuilder: (context, index) => Padding(padding: EdgeInsets.only(right: 5)), 
                  itemCount: profileCompletionCards.length,
                ),
              ),
              SizedBox(height: 35),
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
                    ),
                  ),
                );
              }
              ),
            ],
          ),
        ],
      ),

      //default Scaffold retains base colors of light mode = light blue, dark mode = dark blue
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 3,
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: Icon(MdiIcons.accountOutline),
            activeIcon: Icon(MdiIcons.account),
            label: "Explore"
          ),

          BottomNavigationBarItem(
            icon: Icon(MdiIcons.chartPieOutline),
            activeIcon: Icon(MdiIcons.chartPie),
            label: "Your Info",
          ),

          BottomNavigationBarItem(
            icon: Icon(MdiIcons.lockOutline),
            activeIcon: Icon(MdiIcons.lock),
            label: "For Later"
          ),

          BottomNavigationBarItem(
            icon: Icon(MdiIcons.accountOutline),
            activeIcon: Icon(MdiIcons.account),
            label: "Profile"
          ),
        ]
      ),
    );
  }
}
class ProfileCompletionCard {
  final String title;
  final String buttonText;
  final IconData icon;

  ProfileCompletionCard({
    required this.title,
    required this.buttonText,
    required this.icon,
  });
}

List<ProfileCompletionCard> profileCompletionCards = [
  ProfileCompletionCard(
    title: "Set Your Profile Details",
    buttonText: "Continue",
    icon: CupertinoIcons.person_circle,
  ),
  ProfileCompletionCard(
    title: "Upload Your Resume",
    buttonText: "Upload",
    icon: CupertinoIcons.doc,
  ),
  ProfileCompletionCard(
    title: "Add Your Skills",
    buttonText: "Add",
    icon: CupertinoIcons.square_list,
  ),
];

class CustomListTiles {
  final IconData icon;
  final String title;
  CustomListTiles({
    required this.icon,
    required this.title,
  });
}

List<CustomListTiles> customListTiles = [
  CustomListTiles(
    icon: Icons.insights, 
    title: "Activity",
  ),

  CustomListTiles(
    icon: Icons.location_on_outlined, 
    title: "Location"
  ),

  CustomListTiles(
    icon: CupertinoIcons.bell, 
    title: "Notifications"
  ),

  CustomListTiles(
    icon: CupertinoIcons.arrow_right_arrow_left, 
    title: "Logout"
  ),
];