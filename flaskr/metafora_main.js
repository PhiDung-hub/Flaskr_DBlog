let dologout = 0;
var loginModal;
var myeth = 0;
var providerwc;
var noresetwc = false;

/** MAIN LOGIN PAGE SCRIPT TAKEN FROM METAFORA APP. */

function page(url, e) {
  var form = $("#pageform");
  form.attr("action", url);
  form.submit();
  e.preventDefault();
}

function isMobile() {
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    return true;
  }
  return false;
}

function iOS() {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden" && iOS()) {
    window.localStorage.removeItem("WALLETCONNECT_DEEPLINK_CHOICE");
  }
});

async function login(type) {
  if (isMobile()) {
    // type = 'wallet';
    $("#mmlogin").hide();
  } else {
    $("#mmlogin").show();
  }
  {
    if (!type) {
      if (!loginModal)
        loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
      loginModal.show();
      return;
    }
    loginModal.hide();
  }

  if (true) {
    let options = {};
    var msg = "Verify Metafora sign-in.";
    if (type == "wallet") {
      options = { provider: "walletconnect", signingMessage: msg };
    } else if (type == "coinbase" && typeof web3 == "undefined") {
      window.location = "https://go.cb-w.com/SiRySDaUClb";
      return;
    } else {
      options = { signingMessage: msg };
    }

    console.log("Signing in");
    $("#connect").attr("disabled", true);
    $("#connect").html("Connecting...");
    if (type == "wallet") {
      providerwc = new WalletConnectProvider.default({
        rpc: {
          1: "https://dawn-crimson-haze.quiknode.pro/ede58ec419b88fcafdaa2604332f0fc3251f6075/",
        },
      });
      noresetwc = false;

      providerwc.on("connect", async function () {
        console.log("connect");
        noresetwc = true;

        const account = providerwc.accounts[0];
        myeth = providerwc;
        myeth.selectedAddress = account;
        try {
          console.log("metaverify", account);
          await metaverify();
        } catch (error) {
          console.log("metaverify error", error);
        }
      });
      providerwc.on("disconnect", function (code, reason) {
        console.log("disconnected");
      });
      providerwc.on("accountsChanged", async function (accounts) {
        console.log("acct change", providerwc.connected);
        console.log(accounts);

        setTimeout(async function () {
          if (noresetwc) return;
          await providerwc.close();
          login("wallet");
        }, 1000);
      });
      try {
        console.log("enabling");
        await providerwc.enable();
      } catch (error) {
        console.log("enable error:", error);
        $("#connect").attr("disabled", false);
        $("#connect").html("Connect Wallet");
      }
    } else {
      user = await metaauth();
      $("#connect").attr("disabled", false);
      $("#connect").html("Connect Wallet");
    }
  }
}

async function metaauth() {
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];
    console.log(account);
  } catch (error) {
    console.log(error);
    $("#connect").attr("disabled", false);
    $("#connect").html("Connect Wallet");
  }
  myeth = ethereum;
  return metaverify();
}

async function metaverify() {
  const data = {
    types: {
      EIP712Domain: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "version",
          type: "string",
        },
      ],
      Verify: [
        {
          name: "contents",
          type: "string",
        },
      ],
    },
    primaryType: "Verify",
    domain: {
      name: "Metafora",
      version: "1",
    },
    message: {
      contents: "Verify Metafora sign-in.",
    },
  };
  let sig = "0";
  try {
    sig = await myeth.request({
      method: "eth_signTypedData_v4",
      params: [myeth.selectedAddress, JSON.stringify(data)],
    });
  } catch (error) {
    console.log("sign:", error);
    $("#connect").attr("disabled", false);
    $("#connect").html("Connect Wallet");
    if (providerwc && providerwc.close) providerwc.close();
  }
  $.post(
    appurl + "/login.php",
    { session: sig, custom: 1 },
    async function (rsp) {
      if (!rsp) {
        console.log("login:", rsp);
        $("#connect").attr("disabled", false);
        $("#connect").html("Connect Wallet");
      } else {
        // if (provider && provider.close){ await provider.close();}
        $("#content").html(rsp);
      }
    }
  );
}

async function logout() {
  $("#connect").attr("disabled", true);
  $("#connect").html("Logging out...");
  $.post(appurl + "/login.php", { logout: 1 }, function (rsp) {
    $("#content").html(rsp);
  });
}

function spin(target) {
  var opts = {
    lines: 13, // The number of lines to draw
    length: 38, // The length of each line
    width: 17, // The line thickness
    radius: 45, // The radius of the inner circle
    scale: 0.25, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: "spinner-line-fade-quick", // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: "#aaa", // CSS color or array of colors
    fadeColor: "transparent", // CSS color or array of colors
    top: "50%", // Top position relative to parent
    left: "50%", // Left position relative to parent
    shadow: "0 0 1px transparent", // Box-shadow for the lines
    zIndex: 2000000000, // The z-index (defaults to 2e9)
    className: "spinner", // The CSS class to assign to the spinner
    position: "absolute", // Element positioning
  };

  var spinner = new Spin.Spinner(opts);
  spinner.spin(target.get(0));
}

function log(str) {
  $("#content").append(str);
}
function content(str) {
  return log(str);
}

function jsNumberForAddress(address) {
  const addr = address.slice(2, 10);
  const seed = parseInt(addr, 16);
  return seed;
}

function deletePost(div, pid) {
  var body = $("#post" + pid).html();
  showConfirm(
    "Delete post?",
    "<div class=small>" + body + "</div>",
    "Delete",
    function () {
      $("#" + div).slideUp();
      $.post(appurl + "/deletePost.php?pid=" + pid, function (rsp) {});
    }
  );
}

function showConfirm(title, body, save, callback, precallback) {
  var myModal = new bootstrap.Modal(document.getElementById("confirmModal"));

  $("#confirmModalTitle").html(title);
  $("#confirmModalBody").html(body);
  $("#confirmModalSave").html(save);
  $("#confirmModalSave").off();

  if (!save) {
    $("#confirmModalSave").hide();
  } else {
    $("#confirmModalSave").show();
  }
  $("#confirmModalSave").click(function () {
    if (precallback) precallback();
    myModal.hide();
    if (callback) callback();
  });

  myModal.show();
}

function message(user, uid, username) {
  if (user == "0") {
    login();
    return;
  }
  var myModal = new bootstrap.Modal(document.getElementById("confirmModal"));

  var html =
    "\
  <div class='text-muted small'><span class=bold>To:</span> " +
    username +
    "<div>\
  <textarea class='form-control' id='mailtext' rows='4' style='font-size:0.9em'></textarea>  \
  <div class='text-muted' style='font-size:0.75em;padding:4px 4px 0px 4px;float:right'><div style='position:relative'><div style='position:absolute;left:-40px;top:-1px;' id=sendboxnotice>&nbsp;</div></div></div>\
  <script>limit512($('#mailtext'), $('#sendboxnotice'));</script>\
";
  showConfirm("Send message", html, "Send", function () {
    var msg = $("#mailtext").val();
    $.post("/mail.php", { uid: uid, msg: msg }, function (rsp) {
      content(rsp);
    });
  });
}

function limit512(box, noticebox) {
  var popover = 0;
  box.bind("input propertychange", function () {
    let val = box.val();
    var maxlen = 512;
    var len = val.length;
    if (len > maxlen) {
      let val2 = val.substr(0, maxlen);
      box.val(val2);
      len = maxlen;
    }
    if (noticebox) {
      if (len == 0) noticebox.html("&nbsp;");
      else noticebox.html(len + "/" + maxlen);
    }
    // if(!popover){
    //   var options = {
    //     placement:'bottom',
    //     content:"<div id=autofind style='width:200px;height:100px'>hello there</div>",
    //     html:true,
    //     sanitize:false,
    //   };
    //   popover = new bootstrap.Popover($('#postbox').get(0), options)
    //   popover.show();
    // }
  });
}
