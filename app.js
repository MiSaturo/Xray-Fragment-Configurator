function apply() {
    let sourceText = source.value;
    let sourceObject = {};

    if(!sourceText.trim()){
        console.error("Source config is empty!");
        dest.value = "Source config is empty!" ;
        return;
    }
    

    try {
        sourceObject = JSON.parse(sourceText);
    } catch (error) {
        console.error(error);
        dest.value = "Failed to parse Source Config , Error: \n\n" + error.message
        return;
    }

    let proxyOutbound = sourceObject.outbounds.find(r => r.tag == "proxy");
    if (!proxyOutbound) {
        console.error("Can not find the outbound with proxy tag.");
        dest.value = "Can not find the outbound with proxy tag.";
        return;
    }

    proxyOutbound={...proxyOutbound};

    let destObject = { ...sourceObject };


    if (!proxyOutbound.streamSettings.sockopt) {
        proxyOutbound.streamSettings.sockopt = {};
    }

    proxyOutbound.streamSettings.sockopt = {
        ...proxyOutbound.streamSettings.sockopt,
        dialerProxy: "fragment",
        tcpKeepAliveIdle: 100,
        tcpNoDelay: true
    };



    destObject.outbounds = destObject.outbounds.filter(r => r.tag != "fragment" && r.tag != "proxy")

    destObject.outbounds.unshift(
        {
            "tag": "fragment",
            "protocol": "freedom",
            "settings": {
                "domainStrategy": "AsIs",
                "fragment": {
                    "packets": fg_method.value,
                    "length": fg_length.value,
                    "interval": fg_interval.value
                }
            },
            "streamSettings": {
                "sockopt": {
                    "tcpKeepAliveIdle": 100,
                    "tcpNoDelay": true
                }
            }
        }
    );

    destObject.outbounds.unshift(proxyOutbound);


    dest.value = JSON.stringify(destObject, null, 4);

    return true;
}

async function copyToClipboard(text){
      // Get the text field
  let copyText = document.getElementById("dest");

  // Select the text field
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text inside the text field
  await navigator.clipboard.writeText(text);
  
  // Alert the copied text
  alert("Copied to clipboard!");
 
 }