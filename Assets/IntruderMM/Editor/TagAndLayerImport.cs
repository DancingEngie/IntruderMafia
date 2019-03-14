// using UnityEditor;
//  using UnityEngine;
//  using System.Collections;
 
//  public class TagAndLayerImport : AssetPostprocessor 
//  {

//  	 static string[] tagNames = new string[] { "Enemy", "Door", "Elevator", "Glass", "Slope", "Stairs", "Metal", "AIPath", "", "Slippery", "SuperSlippery", "Water", "Dirt", "Carpet", "Movable", "Tire", "ThickMetal", "Deathzone", "MainLevel", "Destructible", "Ladder", "Mover", "" };
//  	 static string[] layerNames = new string[] { "Doors", "MyPlayer", "MyGun", "APlayer", "OpFpGun", "DoorTrigger", "Glass", "Screen", "", "", "IgnorePlayer", "IgnoreBullet", "NGUI", "Sticky", "Special", "Rooms", "Lights", "Plants", "Terrain", "Terrain2", "OnlyHitLevel", "IgnoreViewCast", "", ""};
//      static void OnPostprocessAllAssets (
     
//      string[] importedAssets, string[] deletedAssets,
//      string[] movedAssets, string[] movedFromAssetPaths) 
//      {
//          if (IsMyFrameWorkTagFile(importedAssets))
//          {
//              SerializedObject tagManager = new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/TagManager.asset")[0]);
 
//              SerializedProperty it = tagManager.GetIterator();
//              bool showChildren = true;

//              int i = 0;
// 			 int h = 8;

//              while (it.NextVisible(showChildren))
//              {

//              	if(i == 1)
//              		it.intValue = 23;
             	
//              	int j = i-2; 

//              	if(j>=0&&j<tagNames.Length)
//              		it.stringValue = tagNames[j];


             	
//                 if(h>=8&&h<=31)
//              	if (it.name == "User Layer "+h)
//                  {
//                  	it.stringValue = layerNames[h-8];

//                  	h++;
//                  }

//                  i++;
//              }
//              tagManager.ApplyModifiedProperties();
//          }
//      }
 
//      static bool IsMyFrameWorkTagFile(string[] asstNames)
//      {
//         //return true;
//          foreach(string s in asstNames)
//          {
//              //replaced by your path
//              if (s.Equals("Assets/IntruderMM/Editor/TagAndLayerImport.cs"))
//                  return true;
//          }   
//          return false;
//      }
//  }