using UnityEditor;
 using UnityEngine;
 using System.Collections;
 
 public class SetPlayerSettings : AssetPostprocessor 
 {
     static void OnPostprocessAllAssets (
     
     string[] importedAssets, string[] deletedAssets,
     string[] movedAssets, string[] movedFromAssetPaths) 
     {
         if (IsMyFrameWorkTagFile(importedAssets))
         {
             
             if(PlayerSettings.colorSpace!=ColorSpace.Linear)
			{
				PlayerSettings.colorSpace=ColorSpace.Linear;
			}

			 if(PlayerSettings.renderingPath!=RenderingPath.DeferredShading)
			{
				PlayerSettings.renderingPath=RenderingPath.DeferredShading;
			}
          
         }
     }
 
     static bool IsMyFrameWorkTagFile(string[] asstNames)
     {
        //return true;
         foreach(string s in asstNames)
         {
         	//Debug.Log(s);
             //replaced by your path
             if (s.Contains("SetPlayerSettings.cs")) 
                 return true;
         }   
         return false;
     }
 }