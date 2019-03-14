#pragma strict

import System;
import System.Collections.Generic;
import System.Text;
import System.Security.Cryptography.X509Certificates;
import System.Net;
import System.Net.Security;

public class MyWebClient extends System.Net.WebClient 
{


	 function  GetWebRequest(uri : Uri) : WebRequest
        {
            var  request : WebRequest = super.GetWebRequest(uri);

            request.Timeout = 20 * 60 * 1000;
            return request;
        }


    // static function   ValidateRemoteCertificate( sender : Object,  cert : X509Certificate,  chain : X509Chain,  error : SslPolicyErrors) : boolean
    // {
    //     // If the certificate is a valid, signed certificate, return true.
    //     if (error == System.Net.Security.SslPolicyErrors.None)
    //     {
    //         return true;
    //     }

    //     // Console.WriteLine("X509Certificate [{0}] Policy Error: '{1}'",
    //     //     cert.Subject,
    //     //     error.ToString());

    //     return false;
    // }

  //       static function UploadFileCallback(sender : System.Object ,  e : System.Net.UploadProgressChangedEventArgs)
		// {
  //   // Displays the operation identifier, and the transfer progress.
  //   	print("asjhdajshgd");
  //   	//print("    uploaded "+e.BytesSent+" of "+e.TotalBytesToSend+" bytes. "+e.ProgressPercentage+" % complete...");
		// }

}