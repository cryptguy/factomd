var currentHeight = 0
var leaderHeight = 0

setInterval(updateHTML,1000);

function updateHTML() {
  getHeight() // Update items related to height
  updateTransactions()
  updataDataDumps()
  updatePeers()
}

$("#dump-container #fullscreen-option").click( function(){
  txtArea = jQuery(this).siblings(".is-active")
  txtArea.toggleClass("fullscreen")
  jQuery(this).toggleClass("absolute-fullscreen-option")
  jQuery(this).toggleClass("fixed-fullscreen-option")
})


// Top tabs on index
$("#indexnav-main > a").click(function() {
  if (jQuery(this).hasClass("is-active")) {

  } else {
    $("#transactions").removeClass("hide")
    $("#local").removeClass("hide")
    $("#dataDump").addClass("hide")
  }
})

$("#indexnav-more > a").click(function() {
  if (jQuery(this).hasClass("is-active")) {

  } else {
    $("#transactions").addClass("hide")
    $("#local").addClass("hide")
    $("#dataDump").removeClass("hide")
  }
})

function updataDataDumps() {
  resp = queryState("dataDump",function(resp){
    obj = JSON.parse(resp)
    $("#dump1 #dumpShort").text(obj.DataDump1.ShortDump)
    $("#dump1 #dumpRaw").text(obj.DataDump1.RawDump)

    $("#dump2 #dumpRaw").text(obj.DataDump2.RawDump)

    $("#dump3 #dumpRaw").text(obj.DataDump3.RawDump)

    $("#dump4 #dumpAuth").text(obj.DataDump4.Authorities)
    $("#dump4 #dumpIdent").text(obj.DataDump4.Identities)
    $("#dump4 #dumpMyNode").text(obj.DataDump4.MyNode)
  })
}

function updateTransactions() {
  resp = queryState("recentTransactions",function(resp){
    obj = JSON.parse(resp)
    //if($("#DBBlockHeight").text() != obj.DirectoryBlock.DBHeight) {
      $("#DBKeyMR > a").text(obj.DirectoryBlock.KeyMR)
      $("#DBBodyKeyMR").text(obj.DirectoryBlock.BodyKeyMR)
      $("#DBFullHash").text(obj.DirectoryBlock.FullHash)
      $("#DBBlockHeight").text(obj.DirectoryBlock.DBHeight)

      $("#panFactoids > #traxList > tbody").html("")
      obj.FactoidTransactions.forEach(function(trans) {
        if(trans.TotalInput > 0.0001) {
          /*$("\
          <tr>\
              <td><a id='factom-search-link' type='facttransaction'>" + trans.TxID + "</a></td>\
              <td>" + trans.TotalInput + "</td>\
              <td>" + trans.TotalInputs + "</td>\
              <td>" + trans.TotalOutputs + "</td>\
          </tr>").insertBefore("#panFactoids > #traxList > tbody >tr:first")*/
          $("#panFactoids > #traxList > tbody").append("\
          <tr>\
              <td><a id='factom-search-link' type='factoidack'>" + trans.TxID + "</a></td>\
              <td>" + trans.TotalInput + "</td>\
              <td>" + trans.TotalInputs + "</td>\
              <td>" + trans.TotalOutputs + "</td>\
          </tr>")
        }
      })

      $("#panEntries > #traxList > tbody").html("")
      if(obj.Entries != null){
        obj.Entries.forEach(function(entry) {
          /*$("\
          <tr>\
              <td><a id='factom-search-link' type='entry'>" + entry.Hash + "</a></td>\
              <td><a id='factom-search-link' type='chainhead'>" + entry.ChainID  + "</a></td>\
              <td>" + entry.ContentLength + "</td>\
          </tr>").insertBefore("#panEntries > #traxList > tbody > tr:first")*/
          if (entry.ChainID == "Processing") {
            $("#panEntries > #traxList > tbody").append("\
            <tr>\
                <td><a id='factom-search-link' type='entry'>" + entry.Hash + "</a></td>\
                <td><a id='factom-search-link' type='chainhead'>" + entry.ChainID  + "</a></td>\
                <td>" + entry.ECCost + "</td>\
            </tr>")
          } else {
            $("#panEntries > #traxList > tbody").append("\
            <tr>\
                <td><a id='factom-search-link' type='entryack'>" + entry.Hash + "</a></td>\
                <td><a id='factom-search-link' type='chainhead'>" + entry.ChainID  + "</a></td>\
                <td>" + entry.ECCost + "</td>\
            </tr>")
          }
        })
      }
      $("section #factom-search-link").click(function() {
        type = jQuery(this).attr("type")
        hash = jQuery(this).text()
        var x = new XMLHttpRequest()
        x.onreadystatechange = function() {
          if(x.readyState == 4) {
            obj = JSON.parse(x.response)
            if (obj.Type != "None") {
              window.location = "search?input=" + hash + "&type=" + type
              //redirect("search?input=" + hash + "&type=" + type, "post", x.response) // Something found
            } else {
              $(".factom-search-error").slideDown(300)
              console.log(x.response)
            }
          }
        }
        var formDataLink = new FormData();
        formDataLink.append("method", "search")
        formDataLink.append("search", hash)

        x.open("POST", "/post")
        x.send(formDataLink)
      })
 //   }
  })
}

function getHeight() {
  resp = queryState("myHeight",function(resp){
    currentHeight = parseInt(resp)
    $("#nodeHeight").val(resp)
  })

  resp = queryState("leaderHeight",function(resp){
    //$("#nodeHeight").val(resp)
    leaderHeight = parseInt(resp)
    updateProgressBar("#syncFirst > .progress-meter", currentHeight, leaderHeight)
    percent = (currentHeight/leaderHeight) * 100
    percent = Math.floor(percent)
    $('#syncFirst > .progress-meter > .progress-meter-text').text(percent + "% Synced (" + currentHeight + " of " + leaderHeight + ")")
  })

    resp = queryState("completeHeight",function(resp){
    //$("#nodeHeight").val(resp)
    completeHeight = parseInt(resp)
    updateProgressBar("#syncSecond > .progress-meter", completeHeight, leaderHeight)
    percent = (completeHeight/leaderHeight) * 100
    percent = Math.floor(percent)
    $('#syncSecond > .progress-meter > .progress-meter-text').text(completeHeight + " of " + leaderHeight)
  })
}

function updateProgressBar(id, current, max) {
  percent = (current/max) * 100
  $(id).width(percent+ "%")
}

function updatePeers() {
  resp = queryState("peers", function(resp){
    obj = JSON.parse(resp)
    console.log(obj)
    for (peer in obj) {
      console.log(peer)
    }
  })
}

/*
$(".tabs-panel > #traxlist").change(function(trax){
    theadChildren = trax.find("thead > tr").first().children()
    tbodyChildren = trax.find("tbody > tr").first().children()
    for (i = 0; i < theadChildren.length; i++) { 
      theadChildren[i].width(tbodyChildren[i].width())
    }  
})*/