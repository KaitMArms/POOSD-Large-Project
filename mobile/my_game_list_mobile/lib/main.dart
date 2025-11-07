/*
void main() {
  //main is the entry point of flutter application
  //const tells Flutter this widget is immutable and can be compiled at build time for performance.
  //runApp means start the app with this widget
  runApp(const MyApp());
}

//statelessWidget means the class/widget is immutable, so statelessWidget only builds UI from the data given.
class MyApp extends StatelessWidget {
  //just attaches iPhone simulator to file
  static final String title = 'Simulator';
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  //build is called whenever Flutter needs to render the widget (something visual) (buildContext is just default included)
  Widget build(BuildContext context) {
    //materialApp is defines the set up of our app (theme, routes, title, etc.)
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // TRY THIS: Try running your application with "flutter run". You'll see
        // the application has a purple toolbar. Then, without quitting the app,
        // try changing the seedColor in the colorScheme below to Colors.green
        // and then invoke "hot reload" (save your changes or press the "hot
        // reload" button in a Flutter-supported IDE, or press "r" if you used
        // the command line to start the app).
        //
        // Notice that the counter didn't reset back to zero; the application
        // state is not lost during the reload. To reset the state, use hot
        // restart instead.
        //
        // This works for code too, not just values: Most code changes can be
        // tested with just a hot reload.
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blueGrey),
      ),
      home: const MyHomePage(title: 'Everybody Dance Now'), //home is a property that means that home is the first screen shown on start-up
    );
  }
}

//statefulWidget means that this state can change over time
//title is passed from MyApp
class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  //createState() creates the state object _MyHomePageState() where all the UI lives
  //why move it on?
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  //private tracks how many times the button has been pressed
  int _counter = 0;

  //updates counter by 1
  void _incrementCounter() {
    //setState is a built-in Flutter function that re-updates the UI every time values are changed
    setState(() {
      // This call to setState tells the Flutter framework that something has
      // changed in this State, which causes it to rerun the build method below
      // so that the display can reflect the updated values. If we changed
      // _counter without calling setState(), then the build method would not be
      // called again, and so nothing would appear to happen.
      _counter++;
    });
  }

  //just syntactic it seems, but a separate method that defines the UI
  @override
  //build seems to be needed every time something visual happens, which was what we were told but re-confirmed here
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    //scaffold widgets are skeletons for your app, provides AppBar, body, floatingAction, center (that may be text), etc.
    return Scaffold(
      //displays top navigation header (it's an app bar)
      appBar: AppBar(
        // TRY THIS: Try changing the color here to a specific color (to
        // Colors.amber, perhaps?) and trigger a hot reload to see the AppBar
        // change color while the other colors stay the same.
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      //Centers the body exactly at the middle of the page
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        //Column arranges children vertically, since Column only works on the y-axis
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its

          // children horizontally, and tries to be as tall as its parent.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          //
          // TRY THIS: Invoke "debug painting" (choose the "Toggle Debug Paint"
          // action in the IDE, or press "p" in the console), to see the
          // wireframe for each widget.
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text('You have pushed the button this many times:'),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ],
        ),
      ),
      //this makes a floating button, like a chatbot or the plus increment button in the demo
      floatingActionButton: FloatingActionButton(
        //onPressed defines the function to run when the button is tapped.
        onPressed: _incrementCounter,

        //tooltip shows text when the floatingActionButton is long-pressed
        tooltip: 'Increment',

        //child adds an Icon widget
        child: const Icon(Icons.add),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}

*/
//imports Flutter's material design library (has Flutter's pre-built widgets): Scaffold, AppBar, Text, FloatingActionButton, etc.
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:my_game_list_mobile/log_in.dart';

void main() {
  runApp(const PlayedIt());
}

class PlayedIt extends StatelessWidget {
  static final String title = 'Simulator';
  const PlayedIt({super.key});

  @override
   Widget build(BuildContext context) {
    //materialApp is defines the set up of our app (theme, routes, title, etc.)
    return MaterialApp(
      title: 'PlayedIt',
      theme: ThemeData(
        fontFamily: GoogleFonts.orbitron().fontFamily,
        brightness: Brightness.light,
        scaffoldBackgroundColor: Color(0xFFDAE1F1),
        //text button fill colors -> light
        inputDecorationTheme: InputDecorationTheme(
            labelStyle: TextStyle(
              color: Colors.black,
              //fontSize: 16,
              ),
            fillColor: Color(0xFFbecbf4),
            filled: true,
        ),
        
        elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              textStyle: TextStyle(
                fontSize: 16,
              )
            ),
        ),
        //text color -> dark
        //text font -> orbitron
      ),

      darkTheme: ThemeData(
        fontFamily: GoogleFonts.orbitron(
          fontWeight: FontWeight.bold,
        ).fontFamily,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Color(0xFF192642),
        //text button fill colors -> dark
        inputDecorationTheme: InputDecorationTheme(
          labelStyle: TextStyle(
            color: const Color.fromARGB(255, 215, 215, 215),
            //fontSize: 16,
            ),
          fillColor: Color(0xFF2047C0),
          filled: true,
        ),
        //text color -> light
        //text font -> orbitron
        elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              textStyle: TextStyle(
                fontSize: 16,
              )
            ),
        ),
      ),
      home: const LogIn(), //home is a property that means that home is the first screen shown on start-up
    );
  }
}

