using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;


[InitializeOnLoad]
public class VersionCheck {

	const string MMVersion = "1.11";
 	public static string unityVersion;
	const string versionCheckAddress = "https://intruder.superbossgames.com/mmversion.txt";
 	public static bool approved = false;

	public static WWW versionWWW;
	public static bool read;
	public static bool startedRead = false;
	public static int timeOut = 0; 

	// Use this for initialization

	static VersionCheck()
    {
		CheckColorSpace();
		Start(); 
	}
 
	static void CheckColorSpace()
	{
		if(PlayerSettings.colorSpace != ColorSpace.Linear)
		{
			Debug.Log("Setting color space to Linear");
			
			PlayerSettings.colorSpace = ColorSpace.Linear;
			
		}
	}
	static void Start () {
		
		if(!startedRead)
		{
		unityVersion = Application.unityVersion;

		versionWWW = new WWW(versionCheckAddress);
		EditorApplication.update += Update;
		startedRead = true;
		}

		//EditorApplication.update += Compiling;
	}
	
	static void Compiling ()
    {
		if(EditorApplication.isCompiling)
		{
			Debug.Log("Still compiling!");
		}
	}
 
	static void Update ()
    {
		if(!startedRead)
		{
        Debug.Log("Checking versions!");
		}

		if(versionWWW.isDone&&!read)
		{
			    if(versionWWW.error==null)
				{
					read = true;
				string myVersionText = versionWWW.text;

				CheckIfVersionIsCorrect(myVersionText);

				EditorApplication.update -= Update;
				}
				else
				{
					read = true;
					Debug.LogError("ERROR: Download error. Couldn't get Intruder MM Version");
					EditorApplication.update -= Update;

				}
				
		}
		else
		{

		}

		timeOut++;

		if(timeOut>1200)
		{
				Debug.LogError("ERROR: Timed out checking versions, make sure your Intruder MM and Unity versions are correct!");
				EditorApplication.update -= Update;
		}
    } 

	static void CheckIfVersionIsCorrect(string myVersionText)
	{
		Debug.Log(myVersionText);
		string[] versionSplit = myVersionText.Split(";"[0]);
		bool err = false;

		if(versionSplit.Length!=2)
		{
			Debug.LogError("Error online MM reading version, check to make sure they are correct and you are connected to the internet!");
			return;
		}

		if(unityVersion!=versionSplit[1])
		{
			Debug.LogError("ERROR: WRONG UNITY VERSION, Please use Unity version "+versionSplit[1]);
			err = true;
		}

		if(MMVersion!=versionSplit[0])
		{
			Debug.LogError("ERROR: WRONG INTRUDER MM VERSION, Please get an update to your Intruder MM! It should be version "+versionSplit[0]);
			err = true;
		}

		if(err)
		return;

		approved = true;
		Debug.Log("Your IntuderMM and Unity3d versions are correct! >:D ");

		

	}

}
