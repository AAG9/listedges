var cb = new ClearBlade();
var platformUrl;
var systemKey;
var isAuthenticated = false;
var userInfo = {};
var edgeList = {};


function SignIn(event){
    event.preventDefault();
    var userEmail = document.getElementById("userEmail").value;
    var userPassword = document.getElementById("userPassword").value;
    var systemSecret = document.getElementById("systemSecret").value;
    platformUrl = document.getElementById("platformUrl").value;
    systemKey = document.getElementById("systemKey").value;
    var signInData = {"email":userEmail, "password":userPassword};
    var client;
    var endpoint = "/api/v/1/user/auth";
    var url_action = platformUrl+endpoint;
    console.log(url_action);
    if(window.XMLHttpRequest)
    {
        client=new XMLHttpRequest();
        //alert("request Obj");
    }
    else
    {
        client=new ActiveXObject("Microsoft.XMLHTTP");
        //alert("request Obj2");
    }
    client.onreadystatechange=function()
    {
        if(client.readyState==4){
            if (client.status==200)
            {
                userAuthenticated(client.responseText)
            }else{
                console.log(client.responseText);
                toastr.error(client.responseText, 'Error', { closeButton: true });
                document.getElementById("statusImage").src = "img/offline.png";
                userInfo.authToken = "";
                $("#edgeList").html('');
            }
        }
    };
    client.open("POST",url_action,true);
    client.setRequestHeader("Content-type", "application/json");
    client.setRequestHeader("ClearBlade-Systemkey", systemKey);
    client.setRequestHeader("ClearBlade-Systemsecret", systemSecret);
    //client.setRequestHeader("Clearblade-usertoken","5kZ6YFTLqb1EmLUjVr-MPl8S125pXE-gNfC1OX8Pv6860IzLsQZsVoBwLbqz6oH5isT0ebXkcP9pBVM1")
    //curl -X POST https://staging.clearblade.com/api/v/2/devices/f887dcf20ac88ade9da9c193facd01/auth -d '{"deviceName":"fan", "deviceToken":"AmeyaChikodi"}' -H 'ClearBlade-Systemkey:f887dcf20ac88ade9da9c193facd01' -H 'ClearBlade-Systemsecret:F887DCF20AFEE5908181DFC4FEB701' -H 'Clearblade-usertoken:5kZ6YFTLqb1EmLUjVr-MPl8S125pXE-gNfC1OX8Pv6860IzLsQZsVoBwLbqz6oH5isT0ebXkcP9pBVM1'
    //curl -X POST https://rtp.clearblade.com/api/v/2/devices/acd4cbf60a9eadefb5b5bdcee7cd01/auth -d '{"deviceName":"fan", "activeKey":"AmeyaChikodi"}' -H 'ClearBlade-Systemkey:acd4cbf60a9eadefb5b5bdcee7cd01' -H 'ClearBlade-Systemsecret:ACD4CBF60AF2F8F7B294C7CDE274'
    client.send(JSON.stringify(signInData));
}


var userAuthenticated = function(resp){
    var response = JSON.parse(resp);
    console.log(response.user_token);
    userInfo.authToken = response.user_token;
    isAuthenticated = true;
    document.getElementById("statusImage").src = "img/online.png";
    toastr.success('Authentication Successful!', 'Success', { closeButton: true });
}


var getEdges = function(event){
    event.preventDefault();
    var client;
    var endpoint = "/api/v/2/edges/"+systemKey;
    var url_action = platformUrl+endpoint;
    console.log(url_action);
    if(isAuthenticated){
        if(window.XMLHttpRequest)
        {
            client=new XMLHttpRequest();
        }
        else
        {
            client=new ActiveXObject("Microsoft.XMLHTTP");
        }
        client.onreadystatechange=function()
        {
            if(client.readyState==4){
                if (client.status==200)
                {
                    listEdges(client.responseText);
                }else{
                    console.log(client.responseText);
                    toastr.error("Authenticate the user first", 'Error', { closeButton: true });
                    userInfo.authToken = "";
                }
            }
        };
        client.open("GET",url_action,true);
        client.setRequestHeader("Content-type", "application/json");
        client.setRequestHeader("ClearBlade-UserToken", userInfo.authToken);
        client.send();
    }else{
        toastr.error("Authenticate the user first", 'Error', { closeButton: true });
        document.getElementById("statusImage").src = "img/offline.png";
    }
}


var listEdges = function(response){
    $("#edgeList").html('');
    edgeList = JSON.parse(response);

    for (var edge = 0; edge <= edgeList.length - 1; edge++) {
        var row = $("<tr/>");

        var name = $("<td/>").text(edgeList[edge].name);
        var description = $("<td/>").text(edgeList[edge].description);
        var public_addr = $("<td/>").text(edgeList[edge].public_addr);
        var public_port = $("<td/>").text(edgeList[edge].public_port);
        
        var edgeStatus = edgeList[edge].isConnected;
        var status = showEdgeStatusImage(edgeStatus);
        
        row.append(name, description, public_addr, public_port, status);
        $("#edgeList").append(row);
    }   
    $("#edgeTable").fadeIn();
    toastr.success('Retrieved list of edges!', 'Success', { closeButton: true });
}


var showEdgeStatusImage = function(edgeStatus){
    var status = $("<td/>");
    var statusImg = "<img src='img/offline.png' alt='Edge Offline' id='statusImage'/>";
    if(edgeStatus){
        statusImg = "<img src='img/online.png' alt='Edge Online' id='statusImage' />";
        status.append(statusImg);
    }else{
        statusImg = "<img src='img/offline.png' alt='Edge Offline' id='statusImage' />";
        status.append(statusImg);
    }
    return status;
}