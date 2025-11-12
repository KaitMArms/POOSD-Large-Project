import 'package:flutter/material.dart';
//import 'package:my_game_list_mobile/log_in.dart';


class LogOut extends StatefulWidget{
  const LogOut({super.key});

  @override
  State<LogOut> createState() => LogOutState();
}

class LogOutState extends State<LogOut>{
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: true,
        backgroundColor: Colors.transparent,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
              child: Text(
                "Thank you for visiting us again! Until the next game.",
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            
            SizedBox(
              height: 20,
            ),

            ElevatedButton(
              onPressed: () {
                Navigator.of(context).popUntil((Route) => Route.isFirst);
              },
              child: Text("Log Out"),
            ),
          ],
        ),
      ),
    );
  }
}