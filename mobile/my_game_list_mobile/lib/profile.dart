import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:my_game_list_mobile/AddGames.dart';
import 'package:my_game_list_mobile/user_details.dart';
import 'package:my_game_list_mobile/log_out.dart';
import 'package:my_game_list_mobile/notifications.dart';
class Profile extends StatefulWidget {
  const Profile({super.key});

  @override
  State<Profile> createState() => _ProfileState();

}
class _ProfileState extends State<Profile> {
  int myIndex = 0;
  List<Widget> widgetList = const [
    Text("Explore", style: TextStyle(fontSize: 40)),
    Text("Your Games List", style: TextStyle(fontSize: 40)),
    Text("For Later", style: TextStyle(fontSize: 40)),
  ];
  @override
  Widget build(BuildContext context) {
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
              GestureDetector(
                onTap: profileAction,
                child: CircleAvatar(
                  radius: 50,
                  backgroundImage: AssetImage("assets/Mascot.png"),
                ),
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
                  Text("(1/3)"),
                ],
              ),

              SizedBox(height: 10),
              Row(
                children: List.generate(3, (index) {
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
              const SizedBox(height: 30),
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
                              ElevatedButton(onPressed: () {
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
              SizedBox(height: 30),
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
                          builder:(context) => tile.page,
                        ));
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

      //default Scaffold retains base colors of light mode = light blue, dark mode = dark blue
    );
  }

  Future<void> profileAction() async {
    //1. Choose Image to Upload 
    //2. Upload Image to Storage Service
    //3. Show and Persist Image in the App (FUCK THIS IS APIs)
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if(image == null) return;
  }
}
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

List<ProfileCompletionCard> profileCompletionCards = [
  ProfileCompletionCard(
    title: "Set Your Profile Details",
    buttonText: "Continue",
    icon: CupertinoIcons.person_circle,
    page: UserDetails(),
  ),
  ProfileCompletionCard(
    title: "Manage Your Lists",
    buttonText: "Continue",
    icon: CupertinoIcons.square_list,
    //page: something
  ),
  ProfileCompletionCard(
    title: "Find More Games",
    buttonText: "Add",
    icon: CupertinoIcons.game_controller,
    page: AddGames()
  ),
];

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

List<CustomListTiles> customListTiles = [
  CustomListTiles(icon: CupertinoIcons.bell, title: "Notifications", page: Notifications()),

  CustomListTiles(icon: CupertinoIcons.arrow_right_arrow_left, title: "Logout", page: LogOut()),
];