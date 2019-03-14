// This script is used to export a Unity scene file into an Intruder Level File .ilf
// We now make .ilfw files for Windows and .ilfm files for Mac
import System.Diagnostics;
import System.Net;
import System;
import System.Collections.Generic;
import System.Linq;
import System.Text;
import System.Security.Cryptography.X509Certificates;
import System.Net.Security;
import System.IO;
import System.Threading;

//INTRUDER MM VERSION 1
 
//@MenuItem("Intruder/Export Scene for Intruder _%e")
static function ExportSceneForIntruder() {
	// if (PlayerPrefs.HasKey("ExportLevel.lastLevelExportFullPath") &&
	// 	PlayerPrefs.HasKey("ExportLevel.lastLevelSceneFilePath") && 
	// 	PlayerPrefs.GetString("ExportLevel.lastLevelSceneFilePath") == EditorApplication.currentScene)
	// {
	// 	PlayerPrefs.DeleteKey("ExportLevel.lastLevelExportFileName");
	// 	MultiPlatformExport(PlayerPrefs.GetString("ExportLevel.lastLevelExportFullPath"));
	// 	return;
	// }
	ExportSceneForIntruderAs();
}

//@MenuItem ("Intruder/Export Scene for Intruder as... _%#e")
static function ExportSceneForIntruderAs() {
	var myPath = "";
	var directory = "";
	var filename  = "";
	
	if (PlayerPrefs.HasKey("ExportLevel.lastLevelExportDirectory")) {
		directory = PlayerPrefs.GetString("ExportLevel.lastLevelExportDirectory");
	}
	else if (PlayerPrefs.HasKey("ExportLevel.intruderWorkingDirectory")) {
		directory = PlayerPrefs.GetString("ExportLevel.intruderWorkingDirectory");
	}
	
	if (PlayerPrefs.HasKey("ExportLevel.lastLevelExportFileName") && 
		PlayerPrefs.HasKey("ExportLevel.lastLevelSceneFilePath") &&
		PlayerPrefs.GetString("ExportLevel.lastLevelSceneFilePath") == EditorApplication.currentScene)
	{
		filename = PlayerPrefs.GetString("ExportLevel.lastLevelExportFileName");
	} else {
		var sceneNameSplit : String[] = EditorApplication.currentScene.Split('/'[0]);
		filename = sceneNameSplit[sceneNameSplit.length-1].Replace('.unity','');	
	}
	
	if(!Directory.Exists(Application.dataPath+"/../Exports/"))
	{
		Directory.CreateDirectory(Application.dataPath+"/../Exports/");
	}

	var myMapName : String;

	if (PlayerPrefs.HasKey("ExportLevel.mapname"))
	{
		myMapName = PlayerPrefs.GetString("ExportLevel.mapname");
	}
	else
	{
		print("Map name not found! Try naming again!");
		return;
	}

	myPath = Application.dataPath+"/../Exports/"+myMapName.ToLower()+".ilf"; // EditorUtility.SaveFilePanel("Export Intruder Level", directory, filename, "ilf");
	MultiPlatformExport(myPath);
}

static function MultiPlatformExport(myPath : String)
{
	DoWorkToExportScene(myPath+"w", 0);
	DoWorkToExportScene(myPath+"m", 1);
	PlayerPrefs.SetString("ExportLevel.lastLevelExportFullPath", myPath);
}

// This is where the actual work is done
static function DoWorkToExportScene(myPath : String, platIndex : int) {

	var defaultLevelName = "Assets/Level1.unity";
	var defaultLevelBackupName = "Assets/Level1.unity_backup";

	if (myPath == "") {
		print("Export canceled");
		return;
	}

	//////////////CLEAN LEVEL
	var cls : CustomLevelSettings = GameObject.FindObjectOfType(CustomLevelSettings);
	
	if(cls!=null)
	{
		cls.SetSettings();
	}
	else
	{
		var clsgo = new GameObject();
		clsgo.name = "CustomLevelSettings";
		cls = clsgo.AddComponent(CustomLevelSettings);
		cls.SetSettings();
	}

	var cams : Camera[] = GameObject.FindObjectsOfType(Camera);
	var camCount = 0;
	
	for(var i = 0;i<cams.length; i++)
	{
		if(cams[i].gameObject.GetComponent(ObserveCamProxy)==null&&cams[i].enabled)
		{
			if(cams[i].targetTexture == null)
			{
			cams[i].enabled = false;
			camCount++;
			}
		}
	}
	if(camCount>0)
	{
		print("You had "+camCount+" extra Cameras enabled, they were disabled for export.");
	}

	var screens : SecurityScreen[] = GameObject.FindObjectsOfType(SecurityScreen);
	for(var ii = 0;ii<screens.length; ii++)
	{
		screens[ii].gameObject.SetActive(false);
	}

	var listeners : AudioListener[] = GameObject.FindObjectsOfType(AudioListener);
	var listenerCount = 0;

	for(i = 0;i<listeners.length;i++)
	{
		if(listeners[i].enabled)
		{
			listeners[i].enabled = false;
			listenerCount++;
		}
	}
	if(listenerCount>0)
	print("You had "+listenerCount+" extra AudioListeners enabled, they were disabled for export.");


	///////////END OF CLEAN UP

	EditorApplication.SaveScene();

	if (EditorApplication.currentScene != defaultLevelName) {
		if (System.IO.File.Exists(defaultLevelName)) {
				FileUtil.ReplaceFile(defaultLevelName, defaultLevelBackupName);
		}
		FileUtil.ReplaceFile(EditorApplication.currentScene, defaultLevelName);
	}
	
	var levels : String[] = [defaultLevelName];
      
	PlayerPrefs.SetString("ExportLevel.lastLevelSceneFilePath", EditorApplication.currentScene);
	
	var myPathSplit : Array = myPath.Split('/'[0]);
	var levelFileName = myPathSplit[myPathSplit.length-1];
	PlayerPrefs.SetString("ExportLevel.lastLevelExportFileName", myPathSplit[myPathSplit.length-1]);
	myPathSplit[myPathSplit.length-1] = '';
	PlayerPrefs.SetString("ExportLevel.lastLevelExportDirectory", myPathSplit.Join('/'));
	
	print("Exporting " + EditorApplication.currentScene + " to " + myPath);
	var crcResult : uint = 0;
	


	var names = AssetDatabase.GetAllAssetBundleNames();
    
    for (var name in names)
    {
        print("Asset Bundle: " + name);
        AssetDatabase.RemoveAssetBundleName(name, true);
    }
	

	// if (Selection.assetGUIDs.Length > 0) 
	// {
	// for (var asset : Object in Selection.objects) 
	// {
	// var path : String = AssetDatabase.GetAssetPath (asset);
	var assetImporter : AssetImporter  = AssetImporter.GetAtPath ("Assets/Level1.unity");
	assetImporter.assetBundleName = levelFileName;
	//print(Selection.assetGUIDs.Length + " Asset Bundles Assigned");
	// }
	// } else {
	// print("No Assets Selected");
	// }

	//BuildPipeline.BuildStreamedSceneAssetBundle(levels, myPath, BuildTarget.StandaloneWindows, crcResult); 
	if(platIndex == 0)
	BuildPipeline.BuildAssetBundles ( myPathSplit.Join('/'), BuildAssetBundleOptions.ForceRebuildAssetBundle,BuildTarget.StandaloneWindows);
	if(platIndex == 1)
	BuildPipeline.BuildAssetBundles ( myPathSplit.Join('/'), BuildAssetBundleOptions.ForceRebuildAssetBundle,BuildTarget.StandaloneOSXIntel);
	
	// UnityEngine.Debug.Log(crcResult);

	// Remember the crc for this level that you exported - blaze
	PlayerPrefs.SetInt("ExportLevel.crc." + PlayerPrefs.GetString("ExportLevel.lastLevelExportFullPath"), crcResult);

	if (EditorApplication.currentScene != defaultLevelName) {
		if (System.IO.File.Exists(defaultLevelBackupName)) {
			FileUtil.ReplaceFile(defaultLevelBackupName, defaultLevelName);
		}
	}

	var go = GameObject.FindObjectOfType(CustomLevelSettings);

	if(go!=null)
	{
		//DestroyImmediate(go.gameObject);
		//Don't destroy this anymore!
	}

	print("Exporting complete!");
	/***
	print( PlayerPrefs.GetString("ExportLevel.lastLevelSceneFilePath") );
	print( PlayerPrefs.GetString("ExportLevel.lastLevelExportFullPath"));
	print( PlayerPrefs.GetString("ExportLevel.lastLevelExportFileName"));
	print( PlayerPrefs.GetString("ExportLevel.lastLevelExportDirectory"));
	***/

	PlayerPrefs.Save();

	names = AssetDatabase.GetAllAssetBundleNames();
    
    for (var name in names)
    {
        print("Asset Bundle: " + name);
        AssetDatabase.RemoveAssetBundleName(name, true);
    }
}

//@MenuItem("Intruder/Select Intruder Application")
static function FindIntruderApplication() {
	var myPath = "";
	
	#if UNITY_EDITOR_OSX
		myPath = EditorUtility.OpenFilePanel("Find Intruder Application", "", "app");
	#endif
	#if UNITY_EDITOR_WIN
		myPath = EditorUtility.OpenFilePanel("Find Intruder Application", "", "exe");	
	#endif
	PlayerPrefs.SetString("ExportLevel.intruderApplicationPath", myPath);

	var intruderApplicationPathSplit : String[] = myPath.Split('/'[0]);
	var intruderApplicationName = intruderApplicationPathSplit[intruderApplicationPathSplit.length-1];
	intruderApplicationPathSplit[intruderApplicationPathSplit.length-1] = '';
	var intruderWorkingDirectory : String = '/';

	for (var i = 0; i < intruderApplicationPathSplit.length-1; i++) {
		intruderWorkingDirectory += intruderApplicationPathSplit[i];
		if (i < intruderApplicationPathSplit.Length-2) {
			intruderWorkingDirectory += '/';
		}
	}

	PlayerPrefs.SetString("ExportLevel.intruderWorkingDirectory",intruderWorkingDirectory);
	PlayerPrefs.SetString("ExportLevel.intruderLevelDirectory",intruderWorkingDirectory + '/content/levels');
	PlayerPrefs.Save();
	
	return myPath;
}

@MenuItem("Intruder/Play Scene in Intruder _%i")
static function CheckNameAndPlayInIntruder()
{
	var savedMapName : String;

	if(PlayerPrefs.HasKey("ExportLevel.mapname"))
	{
		savedMapName = PlayerPrefs.GetString("ExportLevel.mapname");
	}

	if(savedMapName!=null&&savedMapName!="")
	{
		PlaySceneInIntruder();
	}	
	else
	{
		print("Map name not found, open upload menu and name your map!");
	}

}
static function PlaySceneInIntruder() 
{

	var intruderApplicationPath = '';
	
	if (PlayerPrefs.HasKey("ExportLevel.intruderApplicationPath")) {
		intruderApplicationPath = PlayerPrefs.GetString("ExportLevel.intruderApplicationPath");
		
		#if UNITY_EDITOR_OSX
		if (!System.IO.Directory.Exists(intruderApplicationPath)) {
		#endif
		#if UNITY_EDITOR_WIN
		if (!System.IO.File.Exists(intruderApplicationPath)) {
		#endif

			// The Intruder application appears to exist
			print(intruderApplicationPath+" file doesn't appear to exist."); 
			PlayerPrefs.DeleteKey("ExportLevel.intruderApplicationPath");
			PlayerPrefs.Save();
			intruderApplicationPath = '';
		}
		else {
			//print(intruderApplicationPath + " appears to exist.");
		}
	}

	if (intruderApplicationPath == '')
	{
		intruderApplicationPath = FindIntruderApplication();
		if (intruderApplicationPath == '') {
			print('Launch of Intruder canceled');
			return;
		}
	}

	print("About to launch " + intruderApplicationPath);

	// Make sure this scene file is exported
	ExportSceneForIntruder();
	var lastLevelNameNoExtension : String = PlayerPrefs.GetString("ExportLevel.lastLevelExportFileName").Replace('.ilf','');
	var lastLevelExportFullPath : String = PlayerPrefs.GetString("ExportLevel.lastLevelExportFullPath");
	
	var myProc : Process = new Process();
	myProc.StartInfo.FileName = intruderApplicationPath;
	#if UNITY_EDITOR_OSX
	//myProc.StartInfo.Arguments = '--args loadlevel ' + lastLevelNameNoExtension + '';

	myProc.StartInfo.Arguments = '--args loadlevel "' + lastLevelExportFullPath+"m"+ '"';
	#endif
	#if UNITY_EDITOR_WIN
	myProc.StartInfo.Arguments = 'loadlevel "' + lastLevelExportFullPath+"w" + '"';
	#endif
	myProc.Start();

	print("Argments: "+myProc.StartInfo.Arguments);
}

static var serverName = "intruder.superbossgames.com";
static var uploadPath : String;
static var uploading = false;
static var uploadcount : int = 0;
static var defaultUploadUrl : String = "https://" + serverName + "/intruder/dlc5/upload/";
static var uploadUrl : String = "https://" + serverName + "/intruder/dlc5/upload/";


@MenuItem ("Intruder/Login and Upload _%u")
static function LoadLoginWindow () {
	// Get existing open window or if none, make a new one:	

	
	
	var window = ScriptableObject.CreateInstance.<LoginWindow>();

	window.Show();

	// if (PlayerPrefs.HasKey("ExportLevel.username")) 
	// {
	// 	LoginWindow.username = PlayerPrefs.GetString("ExportLevel.username");
	// }

	// if (PlayerPrefs.HasKey("ExportLevel.password")) 
	// {
	// 	LoginWindow.password = PlayerPrefs.GetString("ExportLevel.password");
	// }
}

//@MenuItem( "Intruder/Upload Level _%u" )
static function Upload()
{

	if(EditorApplication.isCompiling)
	{
		print("Please wait until compiling finishes before uploading. Should be done in a few seconds.");
		uploadcount = 5;
		return;
	}
		if(LoginWindow.username==""||LoginWindow.password=="")
		{
			print("Please set login credentials before uploading");
			LoadLoginWindow();
		}
		else
		{

			if(!uploading)
			{
		        var dir : String;
				var fil : String;

		       	if (PlayerPrefs.HasKey("ExportLevel.lastLevelExportDirectory")) {
					dir = PlayerPrefs.GetString("ExportLevel.lastLevelExportDirectory");
				}
				else
				{
					UnityEngine.Debug.LogError("ERROR: Could not find last export directory");
					uploadcount = 5;
					return;
				}

				if (PlayerPrefs.HasKey("ExportLevel.lastLevelExportFileName")) {
					fil = PlayerPrefs.GetString("ExportLevel.lastLevelExportFileName");

					print("fil = "+fil);
				}
				else
				{
					UnityEngine.Debug.LogError("ERROR: Could not find last export file");
					uploadcount = 5;
					return;
				}


		        //var pathd : String = EditorUtility.OpenFilePanel( "Select map to upload", dir, "ilfw" );
		        var pathd : String =dir+fil;
				

				var filePath : String = pathd.Substring(0,pathd.length-5);

				if(!File.Exists(filePath+".ilfw"))
				{
					UnityEngine.Debug.LogError("ERROR: Could not find ilfw file");
					uploadcount = 5;
					return;
				}
				
				if(!File.Exists(filePath+".ilfm"))
				{
					UnityEngine.Debug.LogError("ERROR: Could not find ilfm file");
					uploadcount = 5;
					return;
				}
				
		        if( pathd.Length < 2 )
		                return;

				for (var i = 0; i < 2; i++)
				{
			        var client : MyWebClient = new MyWebClient();
			        
					if(i == 0)
					print( "Uploading ilfw..." );
					if(i == 1)
					print( "Uploading ilfm..." );

			        uploadPath = pathd;

				 	// Also upload the Crc data about the level - blaze
					resetUploadUrl("upload");
				 	var crc : uint = 0;
				 	var crcPrefKey = "ExportLevel.crc." + uploadPath;
				 	if (PlayerPrefs.HasKey(crcPrefKey))
				 	{
				 		crc = PlayerPrefs.GetInt(crcPrefKey);
				 		uploadUrl += "&crc=" + crc;
				 	}

				 	// Platform specific code!
				 	if (i == 0)
				 	{
				 		// Windows
						uploadPath = uploadPath.Substring(0,uploadPath.length-5); //Take out ilfw and put in ilfm
				 		uploadPath += ".ilfw";
				 		uploadUrl += "&platform=0";
				 	}
				 	else if (i == 1)
				 	{
				 		// Mac
				 		uploadPath = uploadPath.Substring(0,uploadPath.length-5); //Take out ilfw and put in ilfm
				 		uploadPath += ".ilfm";
				 		uploadUrl += "&platform=1";
				 	}

				 	// UnityEngine.Debug.Log("crc: " + crc);
					//UnityEngine.Debug.Log(uploadUrl);

			        //thread the upload so that it does not hang the editor
			        var thread = System.Threading.Thread(UploadFile);
			        var params = new UploadFileParameters();
			        params.localPath = uploadPath;
			        params.remoteUrl = uploadUrl;
			     	thread.Start(params);

			     	// EditorUtility.DisplayProgressBar("Publish", "Uploading current version...", 0.9);
			     	// EditorUtility.ClearProgressBar();
		       	}
		    }
	       	else
	       	{
	       		print("Still uploading other file... please wait."); 
	       	}
       }

}

static function ValidateTrue()
{
	return true;
}

class UploadFileParameters {
	var localPath : String;
	var remoteUrl : String;
}

static function UploadFile(parameters)
{
	uploading = true;

	var client : MyWebClient = new MyWebClient();
 
	var aa : System.Uri = new System.Uri(parameters.remoteUrl);

	// print("localPath: " + parameters.localPath);
	// print("remoteUrl: " + parameters.remoteUrl);

    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls ;
    ServicePointManager.ServerCertificateValidationCallback = ExportLevel.ValidateTrue;
	// client.UploadProgressChanged += new UploadProgressChangedEventHandler(client.UploadFileCallback);

	var result = client.UploadFile( aa, parameters.localPath );
	var resultText = Encoding.UTF8.GetString(result);

	print(resultText);
	print( "Upload complete!" );
	uploadcount++;
	uploading = false;
}

static function resetUploadUrl(source : String)
{
	uploadUrl = defaultUploadUrl;
	var secretHash = "su444FDDd3s2243tge5tbRTFFgherq";
	var username;
	var password;
	if (source == "window")
	{
		username = LoginWindow.username;
		password = LoginWindow.password;
	} else {
		username = PlayerPrefs.GetString("ExportLevel.username");
		password = PlayerPrefs.GetString("ExportLevel.password");
	}
	var unityHash = Md5Sum(password + secretHash + username + "420");
	// print("unityHash: " + unityHash);
	uploadUrl += "?nickforum=" + WWW.EscapeURL(username) + "&passforum=" + WWW.EscapeURL(password) + "&myform_hash=" + unityHash; // + "&debug=1";
	// print("uploadUlr: " + uploadUrl);
}

static function TryLogin()
{
	PlayerPrefs.SetInt("ExportLevel.validUnPw", 0);
	LoginWindow.loginStatusText = "Testing login credentials...";
	resetUploadUrl("window");	
	//UnityEngine.Debug.Log(uploadUrl);
	
	var client : MyWebClient = new MyWebClient(); 
	var aa : System.Uri = new System.Uri(uploadUrl);

    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls;
    ServicePointManager.ServerCertificateValidationCallback = ValidateTrue;
	//client.UploadFile( aa, uploadPath );
	// var response = client.GetWebRequest(aa);

	try {
	    var pageContent = client.DownloadString(aa);
	}
	catch (ex)
	{
		//UnityEngine.Debug.Log(ex);
		/***/
	    var receiveStream : System.IO.Stream = ex.Response.GetResponseStream();
	    var encode = System.Text.Encoding.GetEncoding("utf-8");
	    var readStream = new System.IO.StreamReader( receiveStream, encode );
	    pageContent=readStream.ReadToEnd();
	    /***/
	}

	UnityEngine.Debug.Log(pageContent);

	var responseSplit : String[] = pageContent.Split("/"[0]);
	if (responseSplit[0] != "Connected")
	{
		LoginWindow.loginStatusText = "Login error";
		PlayerPrefs.SetInt("ExportLevel.validUnPw", 0);
	}
	else
	{
		LoginWindow.loginStatusText = "Connected";
		PlayerPrefs.SetInt("ExportLevel.validUnPw", 1);
	}
	PlayerPrefs.Save();
}


class LoginWindow extends EditorWindow {
	static var username : String;
	static var password : String;
	static var mapname : String="";
	static var loginStatusText : String = "";
	static var readyToUpload : int = 0;
	static var awoken = false;
	public var uploading : Boolean = false;
	public var timeout :int = 0;

	var window : LoginWindow;

	function Awake(){

	awoken = true;

	if (PlayerPrefs.HasKey("ExportLevel.username")) 
	{
		username = PlayerPrefs.GetString("ExportLevel.username");
	}

	if (PlayerPrefs.HasKey("ExportLevel.password")) 
	{
		password = PlayerPrefs.GetString("ExportLevel.password");
	}

	if (PlayerPrefs.HasKey("ExportLevel.mapname")) 
	{
		mapname = PlayerPrefs.GetString("ExportLevel.mapname");
	}

	if (PlayerPrefs.HasKey("ExportLevel.readyToUpload")) 
	{
		readyToUpload = PlayerPrefs.GetInt("ExportLevel.readyToUpload");

		//UnityEngine.Debug.Log("Ready to upload = "+readyToUpload);
	}


	}
	function CloseUploadWindow()
	{
		var rgx2 : Regex  = new Regex("[^a-zA-Z0-9 -]");
				
				if(mapname!=null&&mapname!="")
				mapname = rgx2.Replace(mapname, "");

				PlayerPrefs.SetString("ExportLevel.username", username);
				PlayerPrefs.SetString("ExportLevel.password", password);
				PlayerPrefs.SetString("ExportLevel.mapname", mapname);
				
				PlayerPrefs.Save();
				this.Close();
	}
	function OnGUI () {

		if(!awoken)
		Awake();

		GUILayout.Label ("Login credentials to upload levels", EditorStyles.boldLabel);
			username = EditorGUILayout.TextField ("Username", username);
			password = EditorGUILayout.PasswordField ("Password", password);
			mapname = EditorGUILayout.TextField ("Map Name", mapname);



			GUILayout.Label (loginStatusText, EditorStyles.boldLabel);

			if(GUILayout.Button("Select Intruder Application"))
			{
				ExportLevel.FindIntruderApplication();
			}
			if(GUILayout.Button("Test Map in Intruder"))
			{
			
			if(mapname!=null&&mapname!="")
			{
			// CloseUploadWindow();
			PlayerPrefs.SetString("ExportLevel.mapname", mapname);
			ExportLevel.CheckNameAndPlayInIntruder();
			
			}
			else
			UnityEngine.Debug.Log("Map name not found, open the Upload Menu and give it a name!");

			}

			if(GUILayout.Button("Test Login"))
			{
				PlayerPrefs.Save();				
				ExportLevel.TryLogin();
			}

			GUILayout.Label (" ", EditorStyles.boldLabel);

			if(GUILayout.Button("Upload"))
			{
				var rgx : Regex  = new Regex("[^a-zA-Z0-9 -]");
				
				if(mapname!=null&&mapname!="")
				mapname = rgx.Replace(mapname, "");

				PlayerPrefs.SetString("ExportLevel.username", username);
				PlayerPrefs.SetString("ExportLevel.password", password);
				PlayerPrefs.SetString("ExportLevel.mapname", mapname);

				
				
				PlayerPrefs.Save();
				//this.Close();

				//CloseUploadWindow();
				ExportLevel.ExportSceneForIntruderAs();
				PlayerPrefs.SetInt("ExportLevel.readyToUpload", 1);
				//this.Close();
				//ExportLevel.Upload();
				//readyToUpload = true;
				
			}

			

			if(GUILayout.Button("Save & Close"))
			{
				CloseUploadWindow();
			}

				if(EditorApplication.isCompiling||readyToUpload==1||uploading)
				{

					if(EditorApplication.isCompiling)
					{
					EditorUtility.DisplayProgressBar("Waiting for compilation", "waiting..."+readyToUpload, .25);
					}
					else
					{

						if(readyToUpload==1)
						{
							if(mapname!="")
							{
								readyToUpload = 0;
								uploading = true;
								PlayerPrefs.SetInt("ExportLevel.readyToUpload", 0);
								ExportLevel.Upload();
							}

						}

					if(uploading)
					{
					
					if(ExportLevel.uploadcount==0)
					EditorUtility.DisplayProgressBar("Uploading map files", "Upload started..."+ExportLevel.uploadcount, .25);
					else if(ExportLevel.uploadcount==1)
					EditorUtility.DisplayProgressBar("Uploading map files", "Uploaded File: "+ExportLevel.uploadcount, .50);
					else if(ExportLevel.uploadcount==2)
					EditorUtility.DisplayProgressBar("Uploading map files", "Uploaded File: "+ExportLevel.uploadcount, .75);
					}
					
					if(ExportLevel.uploadcount>=2)
					{
					uploading = false;
					}

					}

					
				}
				else
				{
					EditorUtility.ClearProgressBar();
				}

	}

	function OnInspectorUpdate()
	{
		Repaint();
	}

}

// static function UploadFileCallback(sender : System.Object ,  e : UploadProgressChangedEventArgs)
// {
//     // Displays the operation identifier, and the transfer progress.
//     	print("asjhdajshgd");
//     	//print("    uploaded "+e.BytesSent+" of "+e.TotalBytesToSend+" bytes. "+e.ProgressPercentage+" % complete...");
// }

static function Md5Sum(strToEncrypt: String)
{
	var encoding = System.Text.UTF8Encoding();
	var bytes = encoding.GetBytes(strToEncrypt);
 
	// encrypt bytes
	var md5 = System.Security.Cryptography.MD5CryptoServiceProvider();
	var hashBytes:byte[] = md5.ComputeHash(bytes);
 
	// Convert the encrypted bytes back to a string (base 16)
	var hashString = "";
 
	for (var i = 0; i < hashBytes.Length; i++)
	{
		hashString += System.Convert.ToString(hashBytes[i], 16).PadLeft(2, "0"[0]);
	}
 
	return hashString.PadLeft(32, "0"[0]);
}
/***
static function Md5Sum(strToEncrypt : String) {
	var ue : System.Text.UTF8Encoding = new System.Text.UTF8Encoding();
	var bytes : byte[] = ue.GetBytes(strToEncrypt);

	// encrypt bytes
	var md5 : System.Security.Cryptography.MD5CryptoServiceProvider = new System.Security.Cryptography.MD5CryptoServiceProvider();
	var hashBytes : byte[] = md5.ComputeHash(bytes);

	// Convert the encrypted bytes back to a string (base 16)
	var hashString : String = "";

	for (var i = 0; i < hashBytes.Length; i++) {
	    hashString += System.Convert.ToString(hashBytes[i], 16).PadLeft(2, "0"[0]);
	}

	return hashString.PadLeft(32, "0"[0]);
}
***/