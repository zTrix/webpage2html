/*=============================================================================
#     FileName: api.js
#         Desc: 
#       Author: Ace
#        Email: madaokuan@gmail.com
#     HomePage: http://orzace.com
#      Version: 0.0.1
#   LastChange: 2013-07-27 15:55:38
#      History:
=============================================================================*/

// --- Data ---

var local_data;
var MY_SPACE = "的个人空间";   //name of myspace
var MAX_LINE = 40;
var PIC_EVERY_TIME = 5;

var chinese = /[\一-\龥]/;
var invalid_letters = /[:"\<\>\\\/\?\*\|]/;
var blank_string = /^\s+$/;

var url_prefix = {
    control : 'http://' + domain + '/0',
    data    : 'http://' + domain + '/c0',
};

var ico = {
    //default
    "dir"     : "/static/img/file-icon/folder.png",
    "general" : "/static/img/file-icon/file.png",

    //codes
    ".h"      : "/static/img/file-icon/head.png",
    ".cpp"    : "/static/img/file-icon/cpp.png",
    ".cxx"    : "/static/img/file-icon/cpp.png",
    ".cc"     : "/static/img/file-icon/cpp.png",
    ".c"      : "/static/img/file-icon/c.png",
    ".cs"     : "/static/img/file-icon/cs.png",
    ".html"   : "/static/img/file-icon/html.png",
    ".xml"    : "/static/img/file-icon/xml.png",
    ".js"     : "/static/img/file-icon/js.png",
    ".php"    : "/static/img/file-icon/php.png",
    ".java"   : "/static/img/file-icon/java.png",
    ".py"     : "/static/img/file-icon/py.png",
    ".rb"     : "/static/img/file-icon/ruby.png",
    //".as"   : "/static/img/file-icon/as.png",

    //pic
    ".jpeg"   : "/static/img/file-icon/pic.png",
    ".png"    : "/static/img/file-icon/pic.png",
    ".jpg"    : "/static/img/file-icon/pic.png",
    ".gif"    : "/static/img/file-icon/pic.png",
    ".ai"     : "/static/img/file-icon/ai.png",
    ".psd"    : "/static/img/file-icon/psd.png",

    //music
    ".mp3"    : "/static/img/file-icon/music.png",
    ".wav"    : "/static/img/file-icon/music.png",
    ".ape"    : "/static/img/file-icon/music.png",

    //video
    ".avi"    : "/static/img/file-icon/video.png",
    ".rm"     : "/static/img/file-icon/video.png",
    ".rmvb"   : "/static/img/file-icon/video.png",
    ".mp4"    : "/static/img/file-icon/video.png",
    ".wmv"    : "/static/img/file-icon/video.png",
    ".mkv"    : "/static/img/file-icon/video.png",

    //office
    ".doc"    : "/static/img/file-icon/word.png",
    ".docx"   : "/static/img/file-icon/word.png",
    ".ppt"    : "/static/img/file-icon/ppt.png",
    ".pptx"   : "/static/img/file-icon/ppt.png",
    ".xls"    : "/static/img/file-icon/excel.png",
    ".xlsx"   : "/static/img/file-icon/excel.png",

    //zip
    ".rar"    : "/static/img/file-icon/zip.png",
    ".tar"    : "/static/img/file-icon/zip.png",
    ".gz"     : "/static/img/file-icon/zip.png",
    ".7z"     : "/static/img/file-icon/zip.png",
    ".zip"    : "/static/img/file-icon/zip.png",

    //else
    ".pdf"    : "/static/img/file-icon/pdf.png",
    ".txt"    : "/static/img/file-icon/txt.png",
    ".exe"    : "/static/img/file-icon/exe.png",
    "group"   : "/static/img/file-icon/group.png",
    "myspace" : "/static/img/file-icon/myspace.png",
};

var GROUP_STATUS = {
    "normal"  : 0,
    "blocked" : 90
};

var GROUP_TYPE = {};

var POSITION = {
    "owner"   : 0,
    "admin"   : 10,
    "member"  : 20,
    "pending" : 90
};


var servers = {
    account   : url_prefix.control + '/account',
    group     : url_prefix.control + '/groups',
    file      : url_prefix.control + '/groups',
    trash     : url_prefix.control + '/groups',
    device    : url_prefix.control + '/devices',
    data      : url_prefix.data + '/groups',
    constants : url_prefix.control + '/constants',
    users     : url_prefix.control + '/users',
};

var LANG = "&locale=zh_CN";

var url_templates = {
    //account
    register:           servers.account + '/register?device_name=web&password={0}',
    login:              servers.account + '/login?device_name=web&user_name={0}&password={1}',
    logout:             servers.account + '/logout?token={0}',
    account_info:       servers.account + '/info?token={0}',
    activate:           servers.account + '/activate?token={0}',
    forgot:             servers.account + '/forgot_password?email={0}',
    reset:              servers.account + '/change_password?token={0}&new_password={1}',
    change:             servers.account + '/change_password?user_name={0}&password={1}&new_password={2}',

    //users
    get_name:           servers.users + '/{0}?token={1}',

    //device
    list_device:        servers.device + '?token={0}',
    unlink_device:      servers.device + '/{0}?token={1}',

    //group
    group_info :        servers.group + '/{0}/info?token={1}',
    quit_group :        servers.group + '/{0}?disband={1}&token={2}',
    remove_member :     servers.group + '/{0}/expel?token={1}&user_id={2}',
    new_group:          servers.group + '?token={0}',
    search_group:       servers.group + '/search?query={0}&token={1}',
    join_group:         servers.group + '/{0}?&token={1}',
    update_group_user:  servers.group + '/{0}/users/{1}/update?token={2}',

    //file
    file_meta:          servers.file + '/{0}/roots/{1}/files/{2}/meta?token={3}&list=true',
    file_trash:         servers.file + '/{0}/roots/{1}/files/{2}/trash?token={3}',
    file_move:          servers.file + '/{0}/roots/{1}/files/{2}/move?token={3}&to_path={4}',
    new_folder:         servers.file + '/{0}/roots/{1}/files/{2}/create_folder?token={3}',
    file_history:       servers.file + '/{0}/roots/{1}/files/{2}/revisions?token={3}',
    rollback_file:      servers.file + '/{0}/roots/{1}/files/{2}/rollback?token={3}&version={4}',

    //trash
    list_trash:         servers.trash + '/{0}/roots/{1}/trashes?token={2}',
    delete_trash:       servers.trash + '/{0}/roots/{1}/trashes/{2}?&token={3}',
    empty_trash:        servers.trash + '/{0}/roots/{1}/trashes/empty?&token={2}',
    restore_trash:      servers.trash + '/{0}/roots/{1}/trashes/{2}/restore?token={3}&to_path={4}',

    //data
    download:           servers.data + '/{0}/roots/{1}/files/{2}?token={3}',
    upload:             servers.data + '/{0}/roots/{1}/files/{2}?token={3}&modified={4}&X-Progress-ID={5}',
    thumbnail:          servers.data + '/{0}/roots/{1}/files/{2}/thumbnails?token={3}&format=png',

    //constants
    group_type:         servers.constants + '/group_types?token={0}',
};

// --- Utils ---

$(function()
{
    $('#login_submit').click(login);            //登录界面的登录按钮
    $('#reg_submit').click(register);           //登录界面的注册按钮
    $('#logout_button').click(logout);          //所有页面的登出按钮
    $('#change_pwd_submit').click(change_password);   //所有页面的登出按钮

    $('#new_folder_button').click(new_folder);  //主页面的新建文件夹按钮

    $('#create_group_submit').click(new_group); //新建群组
    $('#delete_from_trash').click(logout);      //永久删除

    //Home下"更多操作"下的重命名和删除
    $('#rename_button').click(rename);
    $('#delete_button').click(move_to_trash);

    //所有rel属性位tipsy的标签绑定tooltip行为
    //$('[rel=tipsy]').tipsy({gravity: $.fn.tipsy.autoNS, fade: true});
});

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
}

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

function convert_html_symble(str)
{
    res = str.replace('&','&amp;');
    res = res.replace('"','&quot;');

    seg = res.split('<');
    res = seg[0];
    for(var i = 1; i < seg.length; ++i)
        res += ("&lt;" + seg[i]);

    seg = res.split('>');
    res = seg[0];
    for(i = 1; i < seg.length; ++i)
        res += ("&gt;" + seg[i]);

    return res;
}

//trim routine
function LTrim(str)
{
    var i;
    for(i=0;i<str.length;i++)
    {
        if(str.charAt(i)!=" "&&str.charAt(i)!=" ")break;
    }
    str=str.substring(i,str.length);
    return str;
}

function RTrim(str)
{
    var i;
    for(i=str.length-1;i>=0;i--)
    {
        if(str.charAt(i)!=" "&&str.charAt(i)!=" ")break;
    }
    str=str.substring(0,i+1);
    return str;
}

function Trim(str)
{
    return LTrim(RTrim(str));
}

//trigger to show a button
function show_op(obj)
{
    $tr = $(obj);
    $tr.find('button').show();
}

//trigger to hide a button
function hide_op(obj)
{
    $tr = $(obj);
    $tr.find('button').hide();
}

//clear local storage
function flush_local_data()
{
    sessionStorage.clear();
    localStorage.clear();
}

//show a message box
//TODO: use modal dialog instead of alert
function show_dialog(type, msg)
{
    alert(msg);
}

//display a sentense in a <p>
function show_msg($p,msg)
{
    $p.text(msg).show();
}

//given a path, split it to groupname & sub-path
//eg: /Movie/asia/2012 -> [ Movie, /asia/2012 ]
function split_path()
{
    var path = $('#path').attr("name");
    var res = {};
    var path_segment = path.split("/");
    res.name = path_segment[1];
    if(path_segment[2])
        res.path = path_segment[2];
    else
        res.path = "";

    for(var i = 3; i < path_segment.length; ++i)
    {
        res.path += '/';
        res.path += path_segment[i];
    }
    //alert(res.path)
    if(res.path === "")
        res.path = "/";
    return res;
}

//format time display
//para: format - yyyy-MM-dd hh:mm, etc
Date.prototype.format = function(format)
{
    var o = {
        "M+" : this.getMonth()+1,                   //month
        "d+" : this.getDate(),                      //day
        "h+" : this.getHours(),                     //hour
        "m+" : this.getMinutes(),                   //minute
        "s+" : this.getSeconds(),                   //second
        "q+" : Math.floor((this.getMonth()+3)/3),   //quarter
        "S" : this.getMilliseconds()                //millisecond
    }; 
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
    RegExp.$1.length==1 ? o[k] :
    ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
};

function check_password()
{
    $("#pwd_tip").hide();
    $("#pwd_success").hide();
    $("#pwd_error").hide();
    if($("#rpassword").val().length < 5 || $("#rpassword").val().length > 20)
    {
        $('#rpassword').css({"border-color":'#b94a48'});
        $("#pwd_error").text('密码需在5-20个字符之间').show();
        return false;
    }
    else
    {
        $('#rpassword').css({"border-color":'#468847'});
        $("#pwd_success").show();
        return true;
    }

}

function check_username()
{
    $("#username_tip").hide();
    $("#username_error").hide();
    $("#username_success").hide();

    var username = $('#rusername').val();
    var pattern = /^[a-zA-Z0-9_\-]{1,}$/;      // 下划线、数字、字母
    var length = [3,20];

    if(!username.match(pattern))
    {
        $('#rusername').css({"border-color":'#b94a48'});
        $("#username_error").text("只能包含小写字母、数字、'-'及'_'").show();
        return false;
    }

    if(username.length < length[0] || username.length > length[1])
    {
        $('#rusername').css({"border-color":'#b94a48'});
        $("#username_error").text('用户名长度需要在3-20个字符之间').show();
        return false;
    }

    $('#rusername').css({"border-color":'#468847'});
    $("#username_success").show();
    
    return true;
}

function check_nickname()
{
    $("#nick_tip").hide();
    $('#rnick').css({"border-color":'#468847'});
    $("#nick_success").show();
    
    return true;

}


function check_email()
{
    $("#email_tip").hide();
    $("#email_error").hide();
    $("#email_success").hide();
    
    var email = $('#remail').val();
    var pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

    if(!email.match(pattern))
    {
        $('#remail').css({"border-color":'#b94a48'});
        $("#email_error").text('Email的格式好像不对哦').show();
        return false;
    }
    
    $('#remail').css({"border-color":'#468847'});
    $("#email_success").show();
    
    return true;
}

function get_str_length(str)
{
    var s = str.replace(/[^\x00-\xff]/g, 'xx');
    return s.length;
}


function get_packages()
{
    function show_packages(data)
    {
        for(var i = 0; i < data.length; ++i)
        {
            var os = '';
            if(data[i].platform == 'win32' || data[i].platform == 'win64')
                os = 'windows';
            else if(data[i].platform == 'linux32' || data[i].platform == 'linux64')
                os = 'linux';
            else
                os =  data[i].platform;

            var downloads = 0;
            if (data[i].platform == 'win64' || data[i].platform == 'linux64')
                downloads = parseInt(data[i].downloads) + parseInt(data[i-1].downloads);
            else
                downloads = data[i].downloads;

            var url =  '/upload/' + data[i].filename;
            $('#' + os).empty().append( 
                    '<li class="ver">版本：' + data[i].version + '</li>' +
                    '<li class="update">更新：' + data[i].date + '</li>' + 
                    '<li class="size">大小：' + data[i].size + '</li>' +
                    '<li class="system">支持系统：' + data[i].adaptation + '</li>' + 
                    '<li class="size">下载次数：' + downloads + '</li>' 
            );
            $('#' + data[i].platform + '-btn').attr('name', url).attr('title',data[i].platform);
        }
    }

    $.get(
        '/packages-meta',
        show_packages,
        'json'
    );
}


function download_package(obj)
{
    function count_downloads(platform)
    {
        var counter = '/download-counter/' + platform;
        $.post(counter, function(data){});
    }
    var url = obj.name;
    var platform = obj.title;
    count_downloads(platform);
    window.location.href = url;
}


//error handle routine,
//para: data - return val
//      tpye - message box or text line
//      $p   - optional, the <p> tag for text line
function check_error(data,type,$p)
{
    //data = eval("(" + data.responseText + ")");
    if(!data.error_code)
        return data.error_code;

    if(data.error_code == 40100001)
    {
        show_dialog("err","会话过期，请重新登录。");
        flush_local_data();
        window.location.href = "/login";
        return data.error_code;
    }
    //if(data.error_code == ERR_CODE.meta_token_invalid)
    //{
        //get_meta_token();
        //return data.error_code;
    //}
    //var errmsg = "";
    //if(ERR_MSG[data.error_code])
        //errmsg = ERR_MSG[data.error_code];
    //else
        //errmsg = data.errMsg;

    var errmsg = data.user_error_message;
    if(type == "box")
        show_dialog("err",errmsg);
    else
        show_msg($p,errmsg);

    return data.error_code;
}

// format a string template
// usage:
//      var template = "Hello {0}, it is {1} now.";
//      var name = "Ace";
//      var time = "2013/07/07";
//      var str = String.format(template,name,time);
String.format = function(src)
{
    if (arguments.length === 0) 
        return null;
    
    
    var args = Array.prototype.slice.call(arguments, 1);
    for(var i = 0; i < args.length; ++i)
        //args[i] = encodeURIComponent(encodeURIComponent(args[i]));
        args[i] = encodeURIComponent(args[i]);
    
    return src.replace(/\{(\d+)\}/g, function(m, i){
        return args[i];
    });
};

// ajax routine
function request(url, data, method, callback)
{
    $.ajax({
        url: url + LANG,
        data: data,
        type: method,
        contentType: "application/json; charset=utf-8",
        success: callback,
        //error: handle_error,
        error: callback,
        dataType: "json"
    });
}

//check if logged in
function check_logging()
{
    //var token = $("#token").atrr("name");
    if(!localStorage.logging && !sessionStorage.logging)
    {
        flush_local_data();
        self.location.href = "/";
    }
    else
    {
        local_data = JSON.parse(localStorage.data);
        MY_SPACE = local_data.username + MY_SPACE;
    }
}

// hide the loading image
function hide_loading()
{
    $("#loading_gif").hide();
}

// display the details of the currnt path on the dir page
// eg: home > docs > slides
function display_path_bar(url,$p)
{
    segment = url.split("/");
    url = "/" + decodeURIComponent(segment[3]);
    //$p.append('<a href="' + url + '">' + segment[3] + "</a>");
    $p.append('<a href="' + url + '">' + "我的云盘" + "</a>");

    for(var i = 4; i < segment.length; ++i)
    {
        url += ("/" + segment[i]);
        $p.append(' <i class="icon-chevron-right"></i><a href="' +
                url + '"> ' + tidy_display_name(convert_html_symble(decodeURIComponent(segment[i]))) + "</a>");
    }
}

//convert size from Bytes to KB/MB/GB
function tidy_size(size)
{
    if(size <= 1024)
        size += " B";
    else if( size <= 1024*1024)
    {
        size /= 1024;
        size = size.toFixed(2);
        size += " KB";
    }
    else if(size <= 1024*1024*1024)
    {
        size /= (1024.0*1024);
        size = size.toFixed(2);
        size += " MB";
    }
    else
    {
        size /= (1024*1024*1024);
        size = size.toFixed(2);
        size += " GB";
    }

    return size;
}


function tidy_display_name(name)
{
    var disname;

    if(get_str_length(name) > MAX_LINE)
        disname = name.substring(0,24) + "..." + name.substring(name.length - 11,name.length);
    else
        disname = name;

    return disname;
}

//get the current URL and drop the "#" in the end
function get_url()
{
    var path = window.location.href;
    if(path.charAt(path.length - 1) == "#")
        path = path.substring(0,path.length-1);

    return path;
}

function get_token()
{
    var url = get_url();
    var seg = url.split('/');
    var token = seg[seg.length - 1];
    return token;
}

// --- Account Related ---

function register()
{
    if (check_username() === false)
        return;
    if (check_email() === false)
        return;
    if (check_password() === false)
        return;

    if (!$('#term').attr('checked'))
    {
        show_dialog("err","请阅读并确认同意MeePo使用条款");
        return;
    }

    var username = $('#rusername').val();
    var nick = $('#rnick').val();
    var email = $('#remail').val();
    var pwd = $('#rpassword').val();
    pwd = SHA256_hash(pwd);

    form = JSON.stringify({
        "user_name":username,
        "email":email,
        "display_name" : nick,
    });
    
    function after_register (data, status)
    {
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }

        show_dialog("success","恭喜你注册成功！");
        var local_data = {};
        local_data.username = username;
        local_data.token = data.token;
        local_data.device = data.device_id;
        local_data.group = {};
        local_data.move_file = {};
        local_data.move_file.moving = false;

        sessionStorage.setItem("logging",true);
        localStorage.setItem("data",JSON.stringify(local_data));
        self.location.href = "/home";
        
        //window.location.href = "/login";
        //login();
    }

    var add = String.format(url_templates.register, 
        encodeURIComponent(pwd));
    
    request(add, form, "post", after_register);
}

function login()
{
    var username = $('#username').val();
    var pwd = $('#password').val();
    pwd = SHA256_hash(pwd);
    
    function after_login(data,status)
    {
        var local_data = {};
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }
        else
        {
            local_data.username = username;
            local_data.token = data.token;
            local_data.device = data.device_id;
            local_data.group = {};
            local_data.move_file = {};
            local_data.move_file.moving = false;

            if($("#remember_me").attr("checked"))
            {
                localStorage.setItem("logging",true);
                localStorage.setItem("data",JSON.stringify(local_data));
            }
            else
            {
                sessionStorage.setItem("logging",true);
                localStorage.setItem("data",JSON.stringify(local_data));
            }
            self.location.href = "/home";
        }
    }

    var add = String.format(url_templates.login, 
        encodeURIComponent(username), encodeURIComponent(pwd));

    request(add, '', 'post', after_login);
}

function get_uname_by_id(id, callback)
{
    function got_name(data,status)
    {
        var local_data = {};
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }
        else
            callback(data.display_name);
    }

    var add = String.format(url_templates.get_name, 
        id, local_data.token);

    request(add, '', 'get', got_name);
    
}

function logout()
{
    flush_local_data();
    var add = String.format(url_templates.logout, local_data.token);
    request(add, '', 'post', function(data){window.location.href = '/';});
    window.location.href = '/';
}

function activate()
{
    function callback(data, status)
    {
        if(status == 'error')
        {
            data = eval("(" + data.responseText + ")");
            if(!data.error_code)
                return data.error_code;

            if(data.error_code == 40100001)
                $('#err_msg').show();
            return;
        }
        show_dialog('success', '激活成功');
        window.location.href = '/login';
    }
    var token = get_token();
    
    var add = String.format(url_templates.activate, token);
    request(add, '', 'post', callback);
    
}

function forgot_password()
{
    function callback(data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }
        $('.form-signin').empty().append("<h3>邮件发送成功</h3><p>我们发送了一封重置密码的邮件到您的邮箱，请注意查收。</p>");
    }
    var email = $('#forgot_email').val();
    var add = String.format(url_templates.forgot, email);
    request(add, '', 'post', callback);
    
}

function change_password()
{
    function callback(data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }
        show_dialog("sucess","修改成功，请重新登录。");
        flush_local_data();
        window.location.href = "/login";
    }

    var old = $("#old_pwd").val();
    var new_pwd = $('#new_pwd').val();
    var check_pwd = $('#check_new_pwd').val();

    if(new_pwd.length < 5 || new_pwd.length > 20)
    {
        show_dialog("err","密码需要在5-20个字符之间。");
        return;
    }


    if(new_pwd != check_pwd)
    {
        show_dialog("err","两次输入的密码不一致，请重新输入。");
        return;
    }
    old = SHA256_hash(old);
    new_pwd = SHA256_hash(new_pwd);
    
    var add = String.format(url_templates.change, 
        local_data.username,old, new_pwd);
    request(add, '', 'post', callback);
}

function reset_password()
{
    function callback(data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }
        show_dialog("sucess","修改成功，请重新登录。");
        flush_local_data();
        window.location.href = "/login";
    }

    var new_pwd = $('#new_pwd').val();
    var check_pwd = $('#check_new_pwd').val();

    if(new_pwd.length < 5 || new_pwd.length > 20)
    {
        show_dialog("err","密码需要在5-20个字符之间。");
        return;
    }


    if(new_pwd != check_pwd)
    {
        show_dialog("err","两次输入的密码不一致，请重新输入。");
        return;
    }
    new_pwd = SHA256_hash(new_pwd);
    
    var add = String.format(url_templates.reset, get_token(), new_pwd);
    request(add, '', 'post', callback);
}

function redirect()
{
    var token = $("#token").attr("name");
    var code = "";
    var url = get_url();
    
    function do_redirect (data, status)
    {
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }
        else
        {
            local_data = {};
            local_data.username = data.user_name;
            local_data.token = token;
            local_data.device = data.device.device_id;
            local_data.group = {};
            
            sessionStorage.setItem("logging",true);
            localStorage.setItem("data",JSON.stringify(local_data));
            localStorage.setItem("data",JSON.stringify(local_data));
            window.location.href = "/home";
        }
    }

    var add = String.format(url_templates.account_info, token);
    request(add, '', "get", do_redirect);
}


function list_home()
{
    var $table = $("#dir_table");
    var code = "";
    var url = get_url();
    
    function after_home (data, status)
    {
        hide_loading();
        var code = "";
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }
        else
        {
            local_data.userid = data.user_id;
            local_data.email = data.email;
            local_data.own = data.groups_can_own;
            if(!local_data.nick)
            {
                local_data.nick = data.display_name;
                $("#toolbar_username").text("您好，" + local_data.nick );
            }
            for(var i = 0; i < data.groups.groups.length; ++i)
            {
                var disname = tidy_display_name(data.groups.groups[i].group_name);
                if(data.groups.groups[i].group_id != local_data.userid)
                    continue;

                code = '<tr>' +
                    '<td><img src="' + ico.myspace + '" width="25px" height="25px"></img>&nbsp;&nbsp;' +
                    '<a href="' + url + '/' + encodeURIComponent(MY_SPACE) + '">' + MY_SPACE + '</a></td>' +
                    '</tr>';
                $table.append(code);

                var gname = MY_SPACE;
                if( !local_data.group[gname])
                {
                    local_data.group[gname] = data.groups.groups[i];
                }
                break;
            }
            for(var i = 0; i < data.groups.total; ++i)
            {
                // check if it is a live group
                // only display live groups
                if(data.groups.groups[i].status != GROUP_STATUS.normal || 
                    data.groups.groups[i].relation.position == POSITION.pending)
                    continue;

                var gname = data.groups.groups[i].group_name;
                var disname = tidy_display_name(gname);
                if(data.groups.groups[i].group_id == local_data.userid)
                    continue;

                if( !local_data.group[gname])
                    local_data.group[gname] = data.groups.groups[i];
                code = '<tr>' +
                    '<td><img src="' + ico.group + '" width="25px" height="25px"></img>&nbsp;&nbsp;' +
                    '<a href="' + url + '/' + encodeURIComponent(data.groups.groups[i].group_name) + 
                    '">' + disname + '</a></td>' + '</tr>';
                $table.append(code);
            }
            localStorage.setItem("data",JSON.stringify(local_data));
            display_myspace_usage();
        }
    }

    var add = String.format(url_templates.account_info, local_data.token);
    request(add, '', "get", after_home);
}

function display_myspace_usage()
{
    function show_usage (data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        displayed_usage = true;
        var used = data.usage.used;
        var quota = data.usage.quota;
        used = (100*used) / quota;
        used = used.toFixed(1);

        var state = "";
        if(used > 60)
            state = "progress-warning";
        if(used > 80)
            state = "progress-danger";

        size = data.usage.used/1024/1024/1024;
        size = size.toFixed(2);

        $("#usage").append(
                "<li><p>您的个人空间已使用" + used + '%</p></li>' + 
                '<li><div class="progress ' + state + ' progress-striped"><div class="bar" style="width: ' + used + '%;"></div></div></li>' +
                '<li align="right">' + size + '/' + quota/1024/1024/1024 + 'GB</li>'
        );
    }
    
    if(displayed_usage)
        return;

    if(typeof(local_data.group[MY_SPACE]) == 'undefined')
        return;
    var add = String.format(url_templates.group_info, 
        local_data.group[MY_SPACE].group_id, local_data.token);
    request(add, '', "get", show_usage);

}

function get_group_types()
{
    function dis_types (data, status)
    {
        if( status == 'error')
        {
            check_error(data,"box","");
            return;
        }
        
        var name;
        var num;
        var codes = "";
        for(var i = 0; i < data.length; ++i)
        {
            name = data[i].type_str;
            num = data[i].type;
            GROUP_TYPE[name] = num;
            codes += "<option>" + name + "</option>";
        }

        $("#group_type").append(codes);
    }
    var add = String.format(url_templates.group_type, local_data.token);
    request(add, '', "get", dis_types);
}

function new_group()
{
    function refresh (data, status)
    {
        if( status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        show_dialog("success","创建成功。");
        window.location.href = "/group";
    }

    var name = $('#create_group_name').val();
    name = Trim(name);
    var type = GROUP_TYPE[$('#group_type').val()];
    var tags = $("#group_tags").val().split(',');
    var visable;
    
    if($("#visable").attr("checked"))
        visable = true;
    else
        visable = false;

    for(var i = 0; i < tags.length; ++i)
        tags[i] = Trim(tags[i]).toLowerCase();

    if(name === "" || blank_string.test(name))
    {
        $("#create_group_error").text('名称不能为空').show();
        return;
    }

    if(invalid_letters.test(name))
    {
        $("#create_group_error").text('名称不能包含下列字符：\\  /  :  *  ?  "  <  >  |').show();
        return;
    }

    var des = $('#create_group_des').val();
    
    form = JSON.stringify({
        "group_name":name,
        "description":des,
        "tags":tags,
        "type":type,
        "visible_to_search": visable
    });
    
    var add = String.format(url_templates.new_group, local_data.token);
    request(add, form, "post", refresh);
}

function list_group()
{
    var $table = $("#dir_table");
    var code = "";
    var url = get_url();
    
    function genline(name,id,relation)
    {
        if( id == local_data.userid)
            return;
        var disname = tidy_display_name(name);
        var rel;
        if(relation == POSITION.owner){
            rel = '<i class="icon-owner" rel="tipsy" title="群主"></i>';
        }
        else if(relation == POSITION.admin){
            rel = '<i class="icon-admin" rel="tipsy" title="管理员"></i>';
        }
        else{
            rel = '<i class="icon-member" rel="tipsy" title="普通成员"></i>';
        }
        code = '<tr><td><a href="/group/' + encodeURIComponent(name) + '" name="' + id + '" >' + disname +
            '</a></td><td>' + rel + '</td></tr>';
        $table.append(code);
    }
    
    function show_group (data, status)
    {
        var code;
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }
        for(var i = 0; i < data.groups.groups.length; ++i)
        {
            if(data.groups.groups[i].status != GROUP_STATUS.normal || 
                data.groups.groups[i].relation.position == POSITION.pending)
                continue;

            var gname = data.groups.groups[i].group_name;
            if( !local_data.group[gname])
                local_data.group[gname] = data.groups.groups[i];

            genline(gname,data.groups.groups[i].group_id,
                data.groups.groups[i].relation.position);
        }

        localStorage.setItem("data",JSON.stringify(local_data));
        /* reload */
        $('[rel=tipsy]').tipsy({gravity: $.fn.tipsy.autoNS, fade: true});

    }
    

    var add = String.format(url_templates.account_info, local_data.token);
    request(add, '', "get", show_group);
}

function get_group_info()
{
    function genline_pending(username,id,reason,$list)
    {
        var code = "<tr><td>" + username + "</td><td>" + reason + "</td>" +
            '<td><div class="btn-group">' +
            '<button name="' + id + '" onclick="approve(this) " class="btn btn-info btn-small"><i class="icon-ok icon-white"></i></button>' +
            '<button name="' + id + '" onclick="remove_member(this)" class="btn btn-info btn-small"><i class="icon-remove icon-white"></i></button></div></td></tr>';
        $list.append(code);
    }
    
    function genline(username,id,$list,relation,type)
    {
        var code = "<tr><td>" + username + "</td>";
        if(relation === 0)
        {
            code += '<td><div class="btn-group">';
            if(type=="member")
            {
                code += '<button name="' + id + '" onclick="promote(this) "class="btn btn-info btn-small"><i class="icon-arrow-up icon-white"></i></button>';
                code += '<button name="' + id + '" onclick="remove_member(this)" class="btn btn-info btn-small"><i class="icon-remove icon-white"></i></button></div></td>';
            }
            else
                code += '<button name="' + id + '" onclick="demote(this) "class="btn btn-info btn-small"><i class="icon-arrow-down icon-white"></i></button></div></td>';
        }
        else if (relation == 1)
        {
            if(type=="member")
                code += '<td><button name="' + id + '" onclick="remove_member(this)" class="btn btn-info btn-small"><i class="icon-remove icon-white"></i></button></td>';
        }
        else
            code += "<td></td>";
        code += "</tr>";
        $list.append(code);
    }
    var gname = $("#gname").attr("name");
    var $admin_list = $("#admin_list");
    var $member_list = $("#member_list");
    var $pending_list = $("#pending_list");
    var $g_name = $("#g_name");
    var $des = $("#des");
    var $tags = $("#tags");
    var $owner = $("#owner");

    if(!local_data.group[gname])
        history.go(-1);
    
    function show_info(data, status)
    {
        function is_admin(list)
        {
            for(var i = 0; i < list.length; ++i)
                if(local_data.userid == list[i].user_id)
                    return true;

            return false;
        }

        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }
        
        var owner;
        var admin = [];
        var member = [];
        var pending = [];

        for(var i = 0; i < data.users.users.length; ++i)
        {
            if(data.users.users[i].relation.position == POSITION.owner )
                owner = data.users.users[i];
            else if(data.users.users[i].relation.position == POSITION.admin)
                admin.push(data.users.users[i]);
            else if(data.users.users[i].relation.position == POSITION.pending)
                pending.push(data.users.users[i]);
            else
                member.push(data.users.users[i]);
        }
        
        var relation ;

        if(local_data.userid == owner.user_id)
        {
            //it's owner
            relation = 0;
            $("#disable_group").show();
        }
        else if(is_admin(admin))
            //it's admin
            relation = 1;
        else
            //it's member
            relation = 2;

        if(relation <= 1)
            $("#pending_tab").show();
        if(relation !== 0)
            $("#quit_group").show();
        
        if(!showed)
        {
            showed = true;
            
            // show owner
            $owner.after("<p>" + owner.user_name + "</p>");
            
            // show group name
            $g_name.after("<p>" + gname + "</p>");
            
            // show description
            var description =( local_data.group[gname].description === "" ? 
                "群主没有添加任何描述" : local_data.group[gname].description);
            $des.after("<p>" +  convert_html_symble(description) + "</p>");

            // show type & visable
            $("#type").after("<p>" + local_data.group[gname].type_str + "</p>");
            if(local_data.group[gname].visible_to_search)
                $("#visable").after("<p>可以</p>");
            else
                $("#visable").after("<p>不可以</p>");
            
            // show tags
            var tags_codes;
            if(local_data.group[gname].tags.length === 1 && 
                local_data.group[gname].tags[0] === "")
                tags_codes = "<p>群主没有添加任何标签</p>";
            else
            {
                tags_codes = "<p>";
                for(var i = 0; i < local_data.group[gname].tags.length; ++i)
                    tags_codes += '<span class="label label-info">' + local_data.group[gname].tags[i] + '</span>&nbsp;&nbsp;';
                tags_codes += '</p>';
            }
            $tags.after(tags_codes);
            
            // show usage
            var used = data.usage.used;
            var quota = data.usage.quota;
            used = (100*used) / quota;
            used = used.toFixed(1);

            var state = "";
            if(used > 60)
                state = "progress-warning";
            if(used > 80)
                state = "progress-danger";

            $("#gusage").after('<p>' + used + '% (' + quota/1024/1024/1024 + 'GB)</p>' +
                '<div class="progress ' + state + ' progress-striped"><div class="bar" style="width: ' + used + '%;"></div></div>');
        }

        
        $admin_list.empty();
        $member_list.empty();
        $pending_list.empty();

        // show admins
        for(var i = 0; i < admin.length; ++i)
            genline(admin[i].user_name, admin[i].user_id,
                $admin_list,relation, "admin");

        // show members
        for(var i = 0; i < member.length; ++i)
            genline(member[i].user_name, member[i].user_id,
                $member_list,relation, "member");

        //show pending members
        for(var i = 0; i < pending.length; ++i)
            genline_pending(pending[i].user_name, pending[i].user_id,
                pending[i].relation.remark, $pending_list);
        
    }
    
    var add = String.format(url_templates.group_info, 
        local_data.group[gname].group_id, local_data.token);
    request(add, '', "get", show_info);
}

//delete a group
function delete_group(obj)
{
    function refresh (data)
    {
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }

        delete local_data.group[gname];
        localStorage.setItem("data",JSON.stringify(local_data));
        show_dialog("success","操作成功!");
        window.location.href = "/group";
    }

    var gname = $("#gname").attr("name");
    var add = String.format(url_templates.quit_group, 
        local_data.group[gname].group_id, 'true', local_data.token);
    request(add, '', "delete", refresh);
}

//quit a group
function quit_group(obj)
{
    function refresh (data)
    {
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }

        window.location.href = "/group";
    }

    var gname = $("#gname").attr("name");
    var add = String.format(url_templates.quit_group, 
        local_data.group[gname].group_id, 'false', local_data.token);
    request(add, '', "delete", refresh);
}


function search_group()
{
    function genline(index,name,id,$list)
    {
        var disname = tidy_display_name(name);
        var code = "<tr onmouseover='show_op(this)' onmouseout='hide_op(this)'><td><a onclick='group_details(this)' name=" + index + ">" + disname + "</a></td>" +
            '<td><button name="' + id + '" style="display:none" class="btn btn-info btn-small" onclick="join_group(this)">' +
            '<i class="icon-plus icon-white"></i></button></td></tr>';

        $list.append(code);
    }
    function list_res(data, status)
    {
        var code;
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        if(data.total === 0)
            show_dialog("success","没有找到符合的群组");
        else
        {
            search_res = data.groups;
            $("#search_group_table").show();
            $('#dir_table').empty();
            for(var i = 0; i < data.groups.length; ++i)
                genline(i,data.groups[i].group_name,data.groups[i].group_id,$("#dir_table"));
        }

    }

    var gname = $("#search_group_field").val();
    
    var add = String.format(url_templates.search_group,
        gname, local_data.token);
    request(add, '', "get", list_res);

}

function group_details(obj)
{
    if(typeof searchGroupBox != "undefined" && searchGroupBox !== null)
        searchGroupBox.unload();
    
    var time  = new Date(search_res[obj.name].established).format("yyyy-MM-dd hh:mm");
    var codes = "<h4>群名称:</h4><p>   " + search_res[obj.name].group_name  + "</p>" +
        "<h4>群描述:</h4><p>   " + search_res[obj.name].description + "</p>" +
        "<h4>群类型:</h4><p>   " + search_res[obj.name].type_str + "</p>" +
        "<h4>创建时间:</h4><p>   " + time + "</p>";
    
    var tags_codes = "<h4>群标签:</h4>";
    if(search_res[obj.name].tags.length === 1 && 
        search_res[obj.name].tags[0] === "")
        tags_codes += "<p>群主没有添加任何标签</p>";
    else
    {
        tags_codes += "<p>";
        for(var i = 0; i < search_res[obj.name].tags.length; ++i)
            tags_codes += '<span class="label label-info">' + search_res[obj.name].tags[i] + '</span>&nbsp;&nbsp;';
        tags_codes += '</p>';
    }
    codes += tags_codes;
    searchGroupBox = new Messi(codes, {title: '群组详细信息', titleClass: 'info',width:"350px", buttons: [{id: 0, label: '取消', val: 'X'}]});
    //bootbox.alert(codes);
}

function join_group(obj)
{
    function refresh (data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        show_dialog("success","申请成功");
    }

    var g_id = obj.name;
    var form = JSON.stringify({
        "user_id":local_data.userid,
        "remark":"auto"
    });
    
    var add = String.format(url_templates.join_group,
        g_id, local_data.token);
    request(add, form, "post", refresh);
}

function list_pending()
{
    var $table = $("#dir_table");
    function genline(name, id, type)
    {
        var status = "";
        if(type == 1)
            status = "申请加入未批准";
        else
            status = "申请创建未批准";
        if( id == local_data.userid)
            return;
        var disname = tidy_display_name(name);
        code = '<tr><td>' + disname +
            '</td><td>' + status + '</td></tr>';
        $table.append(code);
    }

    function show_pending (data, status)
    {
        var code;
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }
        for(var i = 0; i < data.groups.groups.length; ++i)
        {
            genline(data.groups.groups[i].group_name,
                data.groups.groups[i].group_id, 1);
        }
    }
    

    var add = String.format(url_templates.account_info + 
            '&filters=' + encodeURIComponent('relation.position==90'), 
            local_data.token);
    request(add, '', "get", show_pending);

}

function approve(obj)
{
    function refresh(data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        get_group_info();
        //window.location.reload();
    }

    var gname = $("#gname").attr("name");
    var user_id = obj.name;
    form = JSON.stringify({
        "position":POSITION.member,
    });
    
    var add = String.format(url_templates.update_group_user,
        local_data.group[gname].group_id, user_id, local_data.token);
    request(add, form, "post", refresh);
}

function remove_member (obj)
{
    function refresh (data, status)
    {
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }

        get_group_info();
        //window.location.reload();
    }
    
    var gname = $("#gname").attr("name");
    var add = String.format(url_templates.remove_member,
        local_data.group[gname].group_id, local_data.token, obj.name);
    request(add, '', "post", refresh);

}

function promote(obj)
{
    function refresh(data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        get_group_info();
    }

    var gname = $("#gname").attr("name");
    var user_id = obj.name;
    form = JSON.stringify({
        "position":POSITION.admin,
    });
    
    var add = String.format(url_templates.update_group_user,
        local_data.group[gname].group_id, user_id, local_data.token);
    request(add, form, "post", refresh);
}

function demote(obj)
{
    function refresh(data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        get_group_info();
    }

    var gname = $("#gname").attr("name");
    var user_id = obj.name;
    form = JSON.stringify({
        "position":POSITION.member,
    });
    
    var add = String.format(url_templates.update_group_user,
        local_data.group[gname].group_id, user_id, local_data.token);
    request(add, form, "post", refresh);
}

function list_device()
{
    function genline(device,time)
    {
        code = '<tr onmouseover="show_op(this)" onmouseout="hide_op(this)"><td>' +
            '<bold>'+ device.device_name + '</bold>' +
            '<td>' + time + '</td>' +
            '<td>';
        if (name == "Web")
            code += '';
        else
            code += '<a href="#" name="' + device.device_id + '" onclick="unlink_device(this)"><i class="icon-remove"></i>&nbsp;下线</a>';

        code +=  '</td></tr>';
        $table.append(code);
    }
    var $table = $("#dir_table");
    var code = '';
    
    function callback(data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        for(var i = 0; i < data.devices.length; ++i)
            genline(data.devices[i], data.devices[i].linked_str);
    }

    var add = String.format(url_templates.list_device, local_data.token);
    request(add, '', "get", callback);

}

function unlink_device(obj)
{
    function callback(data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        window.location.reload();
    }

    var add = String.format(url_templates.unlink_device, 
        obj.name, local_data.token);
    request(add, '', "delete", callback);

}

// --- Meta Related ---

function list_dir()
{
    pic_list = [];
    var url = get_url();
    $path_bar = $("#path_info").empty();
    display_path_bar(url,$path_bar);
    
    var path_info = split_path();
    var $table = $("#dir_table");

    // check if it is a legal group
    if(!local_data.group[path_info.name])
        history.go(-1);
    
    function genline(name,size,time,type, thumbnail, icon)
    {
        dir_list.push(name);
        var disname = convert_html_symble(tidy_display_name(name));

        if(size != "--")
        {
            size = tidy_size(size);
        }
        //time = new Date(time).format("hh:mm yyyy-MM-dd");

        if(thumbnail)
            icon = String.format(url_templates.thumbnail, 
                local_data.group[path_info.name].group_id, 
                'meepo', path_info.path + '/' + name, local_data.token);
        else
            icon = '/static/img/file-icon/' + icon + '.png';
        var code = '<tr onmouseover="show_op(this)" onmouseout="hide_op(this)">' +
            '<td><img src="' + icon + '" width="32px"></img>&nbsp;&nbsp;';
        if(type == "dir")
            code += '<a title="' + name + '" href="' + get_url() + '/' + encodeURIComponent(name) + '">' + disname + '</td>';
        else if(size != "0 B")
        {
            var download_add = String.format(url_templates.download, local_data.group[path_info.name].group_id,
                        'meepo', path_info.path + '/' + name, local_data.token);
            code += '<a title="' + name + '" href=' + download_add + '>' + disname + '</a></td>';
        }
        else
            code +=  disname + '</td>';

        code += '<td>' + size + '</td><td>' + time  + '</td>' ;
        code += ('<td><div class="btn-group">' +
            '<button class="btn btn-info btn-mini dropdown-toggle" style="display:none" data-toggle="dropdown"><i class="icon-wrench icon-white"></i>&nbsp;' +
            '<span class="caret"></span></button><ul class="dropdown-menu">' +
            '<li><a name="' + convert_html_symble(name)  +  '" href="#" onclick="pre_rename(this)">' +
            '<i class="icon-repeat"></i>&nbsp;重命名</a></li>' + 
            '<li><a href="#" name="' + convert_html_symble(name) + '" onclick="move_to_trash(this)">' + 
            '<i class="icon-trash"></i>&nbsp;删除</a></li>') + 
            '<li><a name="' + convert_html_symble(name)  +  '" href="#" onclick="cut_file(this)">' +
            '<i class="icon-minus"></i>&nbsp;剪切</a></li>'; 

        if(type != "dir")
        {
            var url = get_url();
            var segments = url.split("/");
            var revision_url = "/revision";

            for(var i = 3; i < segments.length; ++i)
            {
                revision_url += '/';
                revision_url += segments[i];
            }
            revision_url += "/" + encodeURIComponent(name);
            code += ('<li><a href="' + revision_url + '"><i class="icon-search"></i> 查看历史版本</a></li>');
        }
            code += '</ul></div></td></tr>';

        $table.append(code);
    }

    function after_listdir(data, status)
    {
        hide_loading();
        var pic_types = {".jpeg":1,".jpg":1,".png":1};
        var type;
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }

        //display folders first
        for( var i = 0; i < data.contents.length ;++i)
        {
            if(data.contents[i].is_dir)
            {
                var thumbnail = false;
                size = "--";
                type = "dir";
                genline((data.contents[i].name), size, data.contents[i].modified_str, 
                        type, thumbnail, data.contents[i].icon);
            }
        }

        //then display files
        for( var i = 0; i < data.contents.length ;++i)
        {
            if(!data.contents[i].is_dir)
            {
                var thumbnail = false;
                if(data.contents[i].thumbnail_exists)
                    thumbnail = true;

                size = data.contents[i].size;
                if(data.contents[i].name.indexOf(".") > -1 && 
                    ico[/\.[^\.]+$/.exec(data.contents[i].name)[0].toLocaleLowerCase()])
                    type = /\.[^\.]+$/.exec(data.contents[i].name)[0].toLocaleLowerCase();
                else
                    type = "general";

                genline((data.contents[i].name), size, data.contents[i].modified_str, 
                        type, thumbnail, data.contents[i].icon);
            }
        }
    }

    var add = String.format(url_templates.file_meta, local_data.group[path_info.name].group_id,
                'meepo', path_info.path, local_data.token);
    request(add, "", 'get', after_listdir);
}

function list_history()
{
    function genline(obj,$table)
    {
        var size = tidy_size(obj.size);
        var time = new Date(obj.modified).format("hh:mm yyyy-MM-dd");
        var code = "";
        if( size == "0 B")
            code = '<tr><td>版本' + obj.version + '</td>';
        else
        {
            var url = String.format(url_templates.download, local_data.group[path_info.name].group_id,
                        'meepo', path_info.path, local_data.token);
            code = '<tr><td><a href="' + url + '" >版本' + obj.version + '</a></td>';
        }

        function show_history(modified_name)
        {
            code +=  '<td>' + size + '</td>' +
            '<td>' + time + '</td><td>' + modified_name + '</td>' +
            '<td><button class="btn btn-info btn-mini" name="' + encodeURIComponent(obj.version) + 
                '" onclick="rollback(this)">回滚</button></td></tr>'; 

            $table.append(code);
        }

        get_uname_by_id(obj.modified_by, show_history);
    }

    function callback(data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        for( var i = 0; i < data.length ;++i)
        {
            genline(data[i],$table);
        }
    }
    var seg = get_url().split('/');
    var file_name = decodeURIComponent(seg[seg.length - 1]);
    var path_info = split_path();
    var $table = $("#dir_table");
    
    var add = String.format(url_templates.file_history, 
                local_data.group[path_info.name].group_id,
                'meepo', path_info.path, local_data.token);
    request(add, "", 'get', callback);

}

function rollback(obj)
{
    function callback (data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        show_dialog("success","回滚成功！");
        window.location.reload();
    }
    
    var path_info = split_path();
    
    var add = String.format(url_templates.rollback_file, 
                local_data.group[path_info.name].group_id,
                'meepo', path_info.path, local_data.token, obj.name);
    request(add, '', 'post', callback);

}

function cut_file(obj)
{
    var old_name = obj.name;
    var path_info = split_path();
    var old_path = path_info.path + '/' + old_name;
    var group_id = local_data.group[path_info.name].group_id;

    local_data.move_file.moving = true;
    local_data.move_file.group = group_id;
    local_data.move_file.name = old_name;
    local_data.move_file.from = old_path;

    localStorage.setItem("data",JSON.stringify(local_data));
}

function paste_file()
{
    function after_paste (data, status)
    {
        if( status == "error")
        {
            check_error(data,"box", "");
            return;
        }

        local_data.move_file.moving = false;
        localStorage.setItem("data",JSON.stringify(local_data));

        $("#dir_table").empty();
        list_dir();
    }
    
    if(!local_data.move_file.moving)
    {
        show_dialog('err','当前剪切板没有任何文件。');
        return;
    }
    
    var path_info = split_path();
    if(local_data.move_file.group != local_data.group[path_info.name].group_id)
    {
        show_dialog('err','不能在不同群组之间移动文件。');
        return;
    }

    var add = String.format(url_templates.file_move, local_data.group[path_info.name].group_id,
                'meepo', local_data.move_file.from, local_data.token, 
                path_info.path + '/' + local_data.move_file.name);
    request(add, '', 'post', after_paste);
}
    
function pre_rename(obj)
{
    var old_name = obj.name;
    $("#rename_error").hide();
    $("#rename_name").attr("name",old_name);
    $("#rename_name").val(old_name);
    $("#rename_modal").modal('toggle');
    $("#rename_name").focus();
}

function rename()
{
    var old_name = $('#rename_name').attr("name");
    var name = $('#rename_name').val();
    if(name === "" || blank_string.test(name))
    {
        $("#rename_error").text('名称不能为空').show();
        return;
    }

    if(invalid_letters.test(name))
    {
        $("#rename_error").text('名称不能包含下列字符：\\  /  :  *  ?  "  <  >  |').show();
        return;
    }

    var path_info = split_path();
    var old_path = path_info.path + '/' + old_name;
    var new_path = path_info.path + '/' + name;

    form = JSON.stringify({
        "to_path":new_path
    });
    
    function after_rename (data, status)
    {
        if( status == "error")
        {
            check_error(data,"msg",$("#rename_error"));
            return;
        }

        $("#rename_modal").modal('hide');
        $("#dir_table").empty();
        list_dir();
    }

    var add = String.format(url_templates.file_move, local_data.group[path_info.name].group_id,
                'meepo', path_info.path + '/' + old_name, local_data.token, new_path);
    request(add, '', 'post', after_rename);
}

function new_folder()
{
    var name = $('#new_folder_name').val();
    //alert(name);
    if(dir_list.indexOf(name) > -1)
    {
        $("#new_folder_error").text('该文件（夹）已存在，请另取一个名字').show();
        return;
    }
    if(name === "" || blank_string.test(name))
    {
        $("#new_folder_error").text('名称不能为空').show();
        return;
    }

    if(invalid_letters.test(name))
    {
        $("#new_folder_error").text('名称不能包含下列字符：\\  /  :  *  ?  "  <  >  |').show();
        return;
    }
    
    function after_newfolder (data)
    {
        if(status == 'error')
        {
            check_error(data,"msg",$("#new_folder_error"));
            return;
        }

        $("#new_folder_modal").modal('hide');
        $("#dir_table").empty();
        list_dir();
    }

    var path_info = split_path();
    var add = String.format(url_templates.new_folder, local_data.group[path_info.name].group_id,
                'meepo', path_info.path + '/' + name, local_data.token);
    request(add, '', 'post', after_newfolder);
}


function move_to_trash(obj)
{
    var name = obj.name;
    var path_info = split_path();
    path_info.path += ('/' + name);

    function after_trash (data, status)
    {
        if(status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        $("#dir_table").empty();
        dir_list = [];
        list_dir();
    }

    var add = String.format(url_templates.file_trash, local_data.group[path_info.name].group_id,
                'meepo', path_info.path, local_data.token);
    request(add, "", 'post', after_trash);
}

function list_trash()
{
    function factory(group_name)
    {
        function handle_data(data)
        {
            trash_details[group_name] = [];
            hide_loading();
            var type;
            //alert(data.metaList[0].name);
            if (status == 'error')
            {
                check_error(data,"box","");
                return;
            }
            for( var i = 0; i < data.contents.length ;++i)
            {
                if(data.contents[i].is_dir)
                {
                    size = "--";
                    type = "dir";
                }
                else
                {
                    size = data.contents[i].size;
                    type = "general";
                }
                trash_details[group_name].push(data.contents[i]);
                genline(data.contents[i].name,group_name,data.contents[i].changed_str,
                        type, data.contents[i].icon, i);
            }
        }
        return handle_data;
    }
    
    function genline(name, group_name, time, type, icon, index)
    {
        var disname = name.substring(0,name.length - 25);
        disname = convert_html_symble(tidy_display_name(disname));
        var disgname = tidy_display_name(group_name);
        //time = new Date(time).format("MM/dd/yyyy hh:mm");
        var code = '<tr onmouseover="show_op(this)" onmouseout="hide_op(this)">' +
            '<td><img src="/static/img/file-icon/' + icon + '.png" width="32px" height="32px"></img>' + disname + '</td>' +
            '<td>' + disgname + '</td><td>' + time  + '</td>';

        code += ('<td><div class="btn-group">' +
            '<button class="btn btn-info btn-mini dropdown-toggle" style="display:none" data-toggle="dropdown"><i class="icon-wrench icon-white"></i>&nbsp;' +
            '<span class="caret"></span></button><ul class="dropdown-menu">' +
            '<li><a title="'+ group_name  +'" name="' + convert_html_symble(name)  +  '" href="#" onclick="restore_from_trash(this)">' +
            '<i class="icon-resume"></i>&nbsp;恢复</a></li><li><a href="#" title="'+ group_name  +'" name="' + convert_html_symble(name) + '" onclick="delete_from_trash(this)">' + 
            '<i class="icon-trash"></i>&nbsp;删除</a></li>' + 
            '<li><a title="' + group_name + '" name="' + index  +'" href="#" onclick="show_trash_details(this)"><i class="icon-search"></i>&nbsp;详细信息</a></li>'); 
        //'<li><a title="' + group_name + '" name="' + index  +'" href="#" onclick="alert(1)"><i class="icon-search"></i>&nbsp;详细信息</a></li>'); 
        $table.append(code);
    }
    
    function process_group(data, status)
    {
        if (status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        for(var i = 0; i < data.groups.groups.length; ++i)
        {
            if( data.groups.groups[i].relation.position != POSITION.owner && 
                data.groups.groups[i].relation.position != POSITION.admin )
                continue;

            var gname;
            if(data.groups.groups[i].group_id == local_data.userid)
                gname = MY_SPACE;
            else
                gname = data.groups.groups[i].group_name;
            
            $("#empty_trash_toggle").append('<li><a href="#" name="' + gname + '" onclick="empty_trash(this)">' + gname + '</a></li>');
            
            var add = String.format(url_templates.list_trash, 
                        data.groups.groups[i].group_id,
                        'meepo', local_data.token);
            request(add, "", 'get', factory(gname));
        }
    }

    trash_details = {};
    var $table = $("#dir_table");
    var add = String.format(url_templates.account_info, local_data.token);
    request(add, '', "get", process_group);
    
}

function show_trash_details(obj)
{
    if(typeof trashDetailsBox != "undefined" && trashDetailsBox !== null)
        trashDetailsBox.unload();
    
    function show_details(modified_name)
    {
        var codes = "<h4>删除者:</h4><p>" + modified_name   + "</p>" +
            "<h4>原路径:</h4><p>   " + trash_details[obj.title][obj.name].restore_path + "</p>";
        
        trashDetailsBox = new Messi(codes, {title: '详细信息', titleClass: 'info',width:"350px", buttons: [{id: 0, label: '确定', val: 'X'}]});
    }

    get_uname_by_id(trash_details[obj.title][obj.name].modified_by, show_details);
    //alert(obj.title + obj.name)
}

function restore_from_trash(obj)
{
    function refresh (data, status)
    {
        if (status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        $("#alert_restore_sucess").show();
        $("#dir_table tr").remove();
        list_trash();
    }
    
    var group_name = obj.title;

    var name = obj.name;
    var dname = name.substring(0,name.length - 25);
    
    var add = String.format(url_templates.restore_trash, 
                local_data.group[group_name].group_id,
                'meepo', '/' + obj.name, local_data.token, '/' + dname);
    request(add, "", 'post', refresh);

}

function delete_from_trash(obj)
{
    var group_name = obj.title;
    var name = obj.name;
    function refresh (data, status)
    {
        if (status == 'error')
        {
            check_error(data,"box","");
            return;
        }

        window.location.reload();
    }
    
    var add = String.format(url_templates.delete_trash, 
                local_data.group[group_name].group_id,
                'meepo', obj.name, local_data.token);
    request(add, "", 'delete', refresh);
}

function empty_trash(obj)
{
    gname = obj.name;
    function refresh (data,status)
    {
        if(status == 'error')
        {
            check_error(data, 'box', '');
            return;
        }
        window.location.reload();
    }

    var add = String.format(url_templates.empty_trash, 
                local_data.group[gname].group_id,
                'meepo', local_data.token);
    request(add, "", 'post', refresh);

}

function pre_upload()
{
    if(uploading)
    {
        $("#upload_modal").modal('toggle');
        return;
    }

    var path_info = split_path();

    upload_id = guid();
    var url = String.format(url_templates.upload, 
        local_data.group[path_info.name].group_id, 
        'meepo', path_info.path, local_data.token, 
        +new Date(), upload_id);
    $("#upload_form").attr("action",url);
    //$("#mod_id").attr("name",mod_id);
    $("#upload_modal").modal('toggle');
}

function upload_file(obj)
{
    if(obj.files[0].size === 0)
    {
        show_dialog("err","请不要上传空文件");
        window.location.reload();
        return;
    }
    if(obj.files[0].size > MAX_FILE_UPLOAD)
    {
        show_dialog("err","网页版只能上传小于" + MAX_FILE_UPLOAD/1024/1024 + "M的文件");
        window.location.reload();
        return;
    }
    obj.form.submit();
    uploading = 1;
    update_progress();
}

//update the progress bar while uploading file
function update_progress()
{
    $.get(
        'http://' + domain + "/progress?X-Progress-ID=" + upload_id,
        function(data)
        {
            data = eval(data);
            if(data.state == "starting")
                setTimeout(update_progress,500);
            else if(data.state == "uploading")
            {
                var uploaded = 100 * (data.received / data.size);
                uploaded = uploaded.toFixed(0);
                $("#upload_progress").show();
                $("#upload_progress_bar").attr("style","width:" + uploaded + "%;");
                $("#up_pencentage").text("已完成：" + uploaded + '%');
                setTimeout(update_progress,500);
            }
            else
                return;
        }
    );
}

function commit_modification()
{
    if(!uploading)
        return;

    //$("#dir_table").empty();
    //dir_list = [];
    //list_dir();
    window.location.reload();
}
