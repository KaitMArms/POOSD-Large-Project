
import 'package:flutter/material.dart';

class NewPass extends StatefulWidget {
  const NewPass({super.key});

  @override
  State<NewPass> createState() => NewPassUI();

}

class NewPassUI extends State<NewPass>  {
  /*
  we need to make something that:
  1. Moves the text boxes slightly down
  2. Puts the text fields in mild boxes instead
  3. First name, last name text boxes too
  */

  final TextEditingController oldPass = TextEditingController();
  final TextEditingController confirmOldPass = TextEditingController();
  final TextEditingController newPass = TextEditingController();
  final TextEditingController confirmNewPass = TextEditingController();
  
  @override
  void dispose() {
    oldPass.dispose();
    newPass.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    
    return Scaffold(
      body: Padding(
        //make non-arbitrary, looks good but appears different on everyphone due to it being an assigned value
        padding: EdgeInsets.fromLTRB(24, 10, 24, 24),
        child: Center(
          child: ListView(
            shrinkWrap: true,
            physics: AlwaysScrollableScrollPhysics(),
              children: [
                Text("Type in your old password and new password below.", 
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    fontStyle: FontStyle.italic,
                    color: Colors.deepPurpleAccent,
                  ),
                ),
                SizedBox(height: 55,),

                TextField(
                  controller: oldPass,
                  decoration: InputDecoration(
                    filled: true,
                    labelText: "Type Old Password",
                    border: OutlineInputBorder(),
                  ), 
                ),
                SizedBox(height: 16,),

                TextField(
                  controller: confirmOldPass,
                  decoration: InputDecoration(
                    filled: true,
                    labelText: "Confirm Old Password",
                    border: OutlineInputBorder(),
                  ), 
                ),
                SizedBox(height: 16,),

                TextField(
                  controller: newPass,
                  decoration: InputDecoration(
                    filled: true,
                    labelText: "Type New Password",
                    border: OutlineInputBorder(),
                  ), 
                ),
                SizedBox(height: 16,),

                TextField(
                  controller: confirmNewPass,
                  decoration: InputDecoration(
                    filled: true,
                    labelText: "Confirm New Password",
                    border: OutlineInputBorder(),
                  ), 
                ),

                SizedBox(height: 16,),
                ElevatedButton(
                  onPressed: () {
                    //NavigationBar to sign_up.dart
                    Navigator.popUntil(context, (route) => route.isFirst);
                  }, 
                  child: Text("Back to Log-In"))
              ],
            )
          )
        ),
      );
  }
}