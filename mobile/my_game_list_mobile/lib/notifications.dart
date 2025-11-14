import 'package:flutter/material.dart';


class Notifications extends StatefulWidget{
  const Notifications({super.key});

  @override
  State<Notifications> createState() => NotificationsPage();
}

class NotificationsPage extends State<Notifications>{
  bool notificationsEnabled = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: true,
        backgroundColor: Colors.transparent,
      ),
      body: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 1000),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: ListTile(
            title: Text("Notifications"),
            subtitle: Text("Recieve Push Notifications"),
            trailing: Switch(
              value: notificationsEnabled, 
              onChanged: (value) {
                setState(() {
                  notificationsEnabled = value;
                });
              }
            ),
          ),
        ),
      ),
    );
  }
}