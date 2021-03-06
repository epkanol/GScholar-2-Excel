// ==UserScript==
// @name       Google Scholar Excel export
// @namespace  http://eriksklotins.lv/
// @version    0.4
// @description  enter something useful
// @match      *://scholar.google.com/*
// @match      *://scholar.google.se/*
// @grant       none
// @copyright  2014+, E.Klotins, A.Sundelin
// @require https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

;(function($, window)
{

  var installButton = function(title, action)
  {
     var node = $('<a href="#" class="gs_btnPRO gs_in_ib gs_nph gs_nta"><span class="gs_lbl">'+title+'</span></a>');
     return $(node)
      .on('click', action)
      .appendTo('#gs_ab_btns');
  };
    
  var getQueryInfo = function()
  {
     var offset = window.location.href.match(/start=([0-9]+)/);
 
     offset = (offset) ? parseInt(offset[1]): 0; 
     
     var num = window.location.href.match(/num=([0-9]+)/);
     num = (num) ? parseInt(num[1]): 0;  
      
     var q = window.location.href.match(/q=([^&]+)/);
      q = (q) ? q[1] : null; 
      return {offset:offset, num:num, q:q};
  };

  var parseResult = function(i, item)
  {
    //  console.log('parseResult',i, item);
    var offset =  getQueryInfo().offset;
    var index = offset+ i + 1; 
    var title = $('.gs_rt',item).text().replace(/(\r\n|\n|\r|\t)/gm,"");
    var link  = $('.gs_rt a',item).attr('href');
    var clickableLink = ['=HYPERLINK','("',link,'")'].join('');
    var meta = $('.gs_a', item).text().replace(/(\r\n|\n|\r|\t)/gm,"");
    var abstract = $('.gs_rs', item).text().replace(/(\r\n|\n|\r|\t)/gm,"");
    var gscholarid = ""
    $('.gs_fl a',item).each(function(index) {
        var txt = $(this).attr('href');
        if (txt.match(/(cites|cluster)=/gi)) {
            var parm = txt.match(/(cites|cluster)=[\w-]+/gi)[0];
            var id = parm.replace(/(cites|cluster)=/g, "")
            gscholarid = id;
        }
    });

    results.push({ index:index, gscholarid:gscholarid, meta: meta, title: title, link:link,  abstract:abstract, clickableLink:clickableLink});
    //console.log({ index:index,title: title,link:link, meta: meta, abstract:abstract});
  };
    
    var encodeCSV = function (results)
    {
        var result = '';
      for(var i=0;i<results.length;i++)
      {
        var row = [];
      for(var col in results[i])
        {
           
           row.push(results[i][col]);
            
        }
        result += row.join("\t")+"\n";
      }
      return result;
    };
    
    var parsePage = function()
    {
       results = [];
       $('.gs_or').each(parseResult);
        console.log(results);
       var str = encodeCSV(results);
       displayResults(str);
        // console.log(results.length, results);
        
    };
    
    
    var displayResults = function(results)
    {
        var node = $('<div class="ps_results" style="position:fixed;top:0;left:0; width:100%; height:100%; background:rgba(50,50,50, 0.3);z-index:9999;"><div style="background:white;padding:20px;text-align:center;position:relative;top:50%;left:50%;transform:translate(-50%,-50%);"><h3>Copy and paste this text to excel</h3><textarea rows="10" cols="80" style="">'+results+'</textarea></br><button data-action="close">Close</button>&nbsp;<button data-action="next">Next page</button></div></div>');
       
        $(node).appendTo('body');
        $('textarea',node).select();
        $('button[data-action="next"]',node).on('click', function(){ 
          var url = $('b.gs_nma + a').attr('href');
          if (!url)
          {
            alert('You have reached the end!');
          }
          else
          {
            window.localStorage.setItem("g2e-export-continue", true);
            document.location = url;
          }
            //console.log(url);
           
        });
        
         $('button[data-action="close"]',node).on('click', function(){ 
          results = [];
             
             $('.ps_results').remove();
        });
    };
  
    
    var button1 = installButton('Export', parsePage);
    if (  window.localStorage.getItem("g2e-export-continue"))
    {
        window.localStorage.removeItem("g2e-export-continue");
        parsePage();
    }    

})($, window);
