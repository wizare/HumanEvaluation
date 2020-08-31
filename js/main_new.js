document.write("<script type='text/javascript' src='js/FileSaver.js-master/src/FileSaver.js'></script>"); 


// config
each_sent_num = 2;
attr_array = new Array(
    ['Fluency', 'flu'], 
    ['Informative', 'info']
    // ['Relevance', 'rele']
);
max_select_score = 2;



$(document).ready(
        function(){   

        // context Table 
        var a = "<tr><th class='table-td-1'>Conversation Context</th><td class='table-td-2' id='context'></td></tr>"
        var context_table = $('.context-div').find('table');
        context_table.append(a);

        a = "";
        a += "<tr style='display:none;'>";
        a += "<th class='table-td-1'>Candidate Response</th>";
        a += "<td class='table-td-2' id='post'></td>";
        a += "</tr>";
        context_table.append(a);


        for(var i=1;i<=each_sent_num;i++){
            var tmp = "<tr>"+
                "<th class='table-td-1'>Generated Result "+i+"</th>"+
                "<td class='table-td-2' id='response_"+i+"'></td>"+
            "</tr>";
            context_table.append(tmp);
        }

        // score btn
        function make_span_string(attr_name, attr_index, score, sent_index){
            var btn_id_str = attr_name+"-btn-"+(score+1)+"_"+String(sent_index);
            var clk_func_str = "score3("+score+","+attr_index+","+sent_index+")";
            var str = "";
            str += "<span class='score-btn-span' ";
            if (score<0) {
                str += "style='display:none;' "
            }
            str += "><button id='"+btn_id_str+"' ";
            str += "type='button' class='btn btn-info score-btn' "
            str += "onclick='"+clk_func_str+"' ";
            str += "style='cursor:pointer;'>";
            str += score + "</button></span>";
            return str;
        }

        for (var ti = 1; ti <= each_sent_num; ti++) {
            var score_div_str = "";
            score_div_str += "<div class='score-btn-div'>";
            score_div_str += "(Generated Result "+ti+") ";

            for (var ai = 0; ai < attr_array.length; ai++) {
                score_div_str += attr_array[ai][0];
                for (var i = -1; i <= max_select_score; i++) {
                    score_div_str += make_span_string(attr_array[ai][1], ai, i, ti);
                }
            }

            score_div_str += "</div>";
            $('.all-score-btn-container').append(score_div_str);

        }


    }
);


function upload(){

    document.getElementById("previous-btn").disabled=false;
    document.getElementById("next-btn").disabled=false;

    let reads = new FileReader();
    file = document.getElementById('upload_files').files[0];
    reads.readAsText(file, 'utf-8');
    console.log(reads);
    reads.onload = function (e) {
        console.log(e);
        // document.getElementById('result').innerText = this.result
        data = e.target.result;
        lines = data.split("\n");
        id = 0;
        for (var i=0; i<lines.length - 2; i++){
            line = lines[i].split("\t");
            tag_value = parseInt(line[3]);
            console.log(tag_value);
            if (isNaN(tag_value)){
                break;
            }
            id = id + 1;
        };
        line = lines[id].split("\t");
        document.getElementById('context').innerText = line[0];
        document.getElementById('post').innerText = line[1];

        for (var i = 1; i <= each_sent_num; i++) {
            document.getElementById("response_"+i).innerText = line[i+1];
        }

        document.getElementById('lines_id').value = id;
        data = data.replace(/\n/g, "&");
        document.getElementById('data').value = data;
        document.getElementById('page-span').innerText = (id + 1).toString() + "/" + (lines.length - 1).toString();

        if((id - 1) == -1){
            document.getElementById("previous-btn").disabled=true;
        }
        if((id + 1) == (lines.length - 1)){
            document.getElementById("next-btn").disabled=true;
        }

        document.getElementById("submit-btn").disabled=true;

        set_button(line);
    };
}

function is_done(all_values){
    flag = true;
    for(i=(each_sent_num+2); i<all_values.length; i++){
        if(all_values[i] == ""){
            flag = false;
            break;
        }
    }
    return flag;
}

function score3(score_value, pos, response_id){

    document.getElementById("previous-btn").disabled=false;
    document.getElementById("next-btn").disabled=false;

    set_manager_array = new Array();
    var attr_len_num = attr_array.length;
    for (var i = 0; i < attr_array.length; i++) {
        var tmp_arr = new Array();
        for (var j = 0; j <= max_select_score+1; j++) {
            tmp_arr[j] = document.getElementById(attr_array[i][1]+"-btn-"+j+"_" + String(response_id));
        }
        set_manager_array.push(tmp_arr);
    }


    var data = document.getElementById('data').value;
    var lines = data.split("&");
    var id = parseInt(document.getElementById('lines_id').value);

    var values = lines[id].split("\t");

    for(i=0; i<values.length; i++){
        values[i].replace("&", "").replace("\t", "");   
    }

    console.log(values);
    console.log(pos);
    index = 2 + each_sent_num + attr_len_num * (response_id-1) + pos;
    console.log(index);

    values[index] = score_value.toString();

    for (i = 0; i < (max_select_score+2); i++) { 
        set_manager_array[pos][i].classList.add("btn-info");
        set_manager_array[pos][i].classList.remove("btn-warning");
    }
    set_manager_array[pos][parseInt(values[index]) + 1].classList.add("btn-warning");

    // lines[id] = context + "\t" + post + "\t" + response + "\t" + score1 + "\t" + score2 + "\t" + score3;
    lines[id] = values.join("\t");
    console.log(lines[id]);
    var new_data = ""
    for (var i=0; i<lines.length - 1; i++){
        new_line = lines[i].replace(new RegExp("&", "gm"), "");
        new_data = new_data + new_line + "&";
    };
    last_index = lines.length - 1
    new_line = lines[last_index].replace(new RegExp("&", "gm"), "");
    new_data = new_data + new_line;
    document.getElementById('data').value = new_data;

    if(is_done(values)){
        if((id + 1) < (lines.length - 1)){
            id = id + 1;
            var current_value = lines[id].toString();
            var line = current_value.split("\t");
            document.getElementById('context').innerText = line[0];
            document.getElementById('post').innerText = line[1];
            for (var i = 1; i <= each_sent_num; i++) {
                document.getElementById("response_"+i).innerText = line[i+1];
            }
            document.getElementById('lines_id').value = id;
            document.getElementById('page-span').innerText = (id + 1).toString() + "/" + (lines.length - 1).toString();
            set_button(line);
        }
        else{
            alert("Finish, thank you!");
        }

    }
    if((id - 1) == -1){
        document.getElementById("previous-btn").disabled=true;
    }
    if((id + 1) == (lines.length - 1)){
        document.getElementById("next-btn").disabled=true;
    }
}


function save(){
    var file_name = prompt("Filename:", ".csv");
    var data = document.getElementById('data').value;
    var lines = data.split("&");
    var tag_result = new Array();
    for (var i=0; i<lines.length - 1; i++){
        lines[i] = lines[i].replace(new RegExp("&", "gm"), "");
        tag_result.push(lines[i] + "\n");
    };
    last_index = lines.length - 1
    lines[last_index] = lines[i].replace(new RegExp("&", "gm"), "");
    tag_result.push(lines[last_index]);
    var new_file = new File(tag_result, file_name, { type: "text/plain;charset=utf-8" });
    saveAs(new_file);
}

function next(){
    var id = parseInt(document.getElementById('lines_id').value);
    if((id + 1) < (lines.length - 1)){
        document.getElementById("previous-btn").disabled=false;
        id = id + 1;
        
        var data = document.getElementById('data').value;
        var new_lines = data.split("&");
        var current_value = new_lines[id].toString();
        var line = current_value.split("\t");
        for(i=0; i<line.length; i++){
            line[i].replace("&", "").replace("\t", "").replace("\n", "");   
        }

        document.getElementById('context').innerText = line[0];
        document.getElementById('post').innerText = line[1];
        for (var i = 1; i <= each_sent_num; i++) {
            document.getElementById("response_"+i).innerText = line[i+1];
        }

        document.getElementById('lines_id').value = id;
        document.getElementById('page-span').innerText = (id + 1).toString() + "/" + (lines.length - 1).toString();

        if((id + 1) == (lines.length - 1)){
            document.getElementById("next-btn").disabled=true;
        }
        set_button(line);
    }
    else{
        alert("The last");
    }
}

function set_button(all_values){
    var attr_len_num = attr_array.length;
    for(k=(each_sent_num+2); k<all_values.length; k++){
        response_id = parseInt((k - (each_sent_num+2)) / (attr_len_num) ) + 1;
        pos = (k-(each_sent_num+2)) % (attr_len_num);

        set_manager_array = new Array();
        for (var i = 0; i < attr_array.length; i++) {
            var tmp_arr = new Array();
            for (var j = 0; j <= max_select_score+1; j++) {
                tmp_arr[j] = document.getElementById(attr_array[i][1]+"-btn-"+j+"_" + String(response_id));
            }
            set_manager_array.push(tmp_arr);
        }

        for (i = 0; i < (max_select_score+2); i++) { 
            set_manager_array[pos][i].classList.add("btn-info");
            set_manager_array[pos][i].classList.remove("btn-warning");
        }
        if(all_values[k]!=""){
            set_manager_array[pos][parseInt(all_values[k]) + 1].classList.add("btn-warning");
        }
    }
}


function previous(){
    var id = parseInt(document.getElementById('lines_id').value);
    if((id - 1) > -1){
        document.getElementById("next-btn").disabled=false;
        id = id - 1;

        var data = document.getElementById('data').value;
        var lines = data.split("&");
        var current_value = lines[id].toString();
        var line = current_value.split("\t");
        for(i=0; i<line.length; i++){
            line[i].replace("&", "").replace("\t", "").replace("\n", "");   
        }
        document.getElementById('context').innerText = line[0];
        document.getElementById('post').innerText = line[1];

        for (var i = 1; i <= each_sent_num; i++) {
            document.getElementById("response_"+i).innerText = line[i+1];
        }
        document.getElementById('lines_id').value = id;
        document.getElementById('page-span').innerText = (id + 1).toString() + "/" + (lines.length - 1).toString();

        if((id - 1) == -1){
            document.getElementById("previous-btn").disabled=true;
        }
        set_button(line);
    }
    else{
        alert("The last");
    }
}