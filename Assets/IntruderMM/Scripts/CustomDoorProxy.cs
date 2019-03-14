using UnityEngine;
using System;


public class CustomDoorProxy:MonoBehaviour
{
	
	public GameObject doorHinge;
	public bool reverse = false;
	
	public bool alwaysLock = false;
	public bool neverLock = false;
	public int maxDoorAngle = 150;
	
	public GameObject partnerDoor;
	
	public bool slidingDoor = false;
	public Vector3 slideDistance;


}