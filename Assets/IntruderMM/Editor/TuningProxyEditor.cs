using UnityEngine;
using System.Collections;
using UnityEditor;

[CustomEditor(typeof(TuningProxy))]
public class TuningProxyEditor : Editor
{
    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();
        
        TuningProxy myScript = (TuningProxy)target;
        if(GUILayout.Button("Check JSON formatting"))
        {
            myScript.CheckJSON();
        }
    }
}