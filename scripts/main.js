//#region var/const declarations;
var lastNames = ["Offensive Unit", "Defensive Unit", "Special Teams"]
// Header
var btnExport = document.getElementById("head-export");
// Time
var clockMain = document.getElementById("clock-main");
var clockPer = document.getElementById("period");
var clockKickOff = document.getElementById("kick-off");
var clockBreak = document.getElementById("break");
var secondsM = 0;
var minutesM = 0;
var IntervalM;
// Team
var txtHome = document.getElementById("home")
var txtAway = document.getElementById("away")
var txtHScore = document.getElementById("score-h")
var txtAScore = document.getElementById("score-a")
var btnP1 = document.getElementById("btn1");
var btnP2 = document.getElementById("btn2");
var btnP3 = document.getElementById("btn3");
//Metrics
var btnM1Lbl = document.getElementById("m1-lbl");
var btnM2Lbl = document.getElementById("m2-lbl");
var btnM3Lbl = document.getElementById("m3-lbl");
var btnM1H = document.getElementById("m1-h");
var btnM2H = document.getElementById("m2-h");
var btnM3H = document.getElementById("m3-h");
var btnM1A = document.getElementById("m1-a");
var btnM2A = document.getElementById("m2-a");
var btnM3A = document.getElementById("m3-a");
var btnM1ValH = document.getElementById("m1-val-h");
var btnM2ValH = document.getElementById("m2-val-h");
var btnM3ValH = document.getElementById("m3-val-h");
var btnM1ValA = document.getElementById("m1-val-a");
var btnM2ValA = document.getElementById("m2-val-a");
var btnM3ValA = document.getElementById("m3-val-a");
var btnM1PosH = document.getElementById("m1-pos-h");
var btnM2PosH = document.getElementById("m2-pos-h");
var btnM3PosH = document.getElementById("m3-pos-h");
var btnM1NegH = document.getElementById("m1-neg-h");
var btnM2NegH = document.getElementById("m2-neg-h");
var btnM3NegH = document.getElementById("m3-neg-h");
var btnM1PosA = document.getElementById("m1-pos-a");
var btnM2PosA = document.getElementById("m2-pos-a");
var btnM3PosA = document.getElementById("m3-pos-a");
var btnM1NegA = document.getElementById("m1-neg-a");
var btnM2NegA = document.getElementById("m2-neg-a");
var btnM3NegA = document.getElementById("m3-neg-a");

//Analysis
var tblAnl = document.getElementById("tbl-anl");

// Helper
const arrSum = arr => arr.reduce((a,b) => a + b, 0);
//#endregion

//#region  INITIALIZATION
//#region  Initialize Dictionaries
var struct_general = {  // Generic Container
    "nplay": 3,
    "nper": 0,
    "per_time": [],
    "metric_name": ["Shots", "Incomplete Passes", "Possession Loss"],
    "metric_val": [[0, 0], [0, 0], [0, 0]]
};
var struct_time = { // Time Container
    "period": clockPer.innerHTML,
    "clock_main": clockMain.innerHTML,
    "kickofftgl": 0,
}
var struct_match = { // Match Information Container
    "date": "", // YYYY-MM-DD
    "location": "Stadium",
    "competition": "Competition",
    "stage": "Stage",
    "kickoff": "", // 00h:00
    "score": [0, 0], // Home, Away
    "teams": ["Home Team", "Away Team"],
    "initials": ["HOME", "AWAY"]
}
var struct_team = { // Team Information Container
    "name": "Team",
    "tgl_home": 1,
    "players": []
}
for(var i = 0; i<(struct_general.nplay); i++) {
    var pinfo = {
        "pid": i+1,
        "nfirst": "Player",
        "nlast": lastNames[i],
        "pno": i+1,
        "position": "",
        "selected": 0,
        "active": 0,
        "tplay": 0,
        "trest": 0,
        "totplay": 0,
        "totrest": 0
    }
    struct_team["players"].push(pinfo)
}
//#endregion
//#region Initialize Tables
var tbl_match = {
    "index": [],
    "period": [],
    "timestamp": [],
    "min_run": [],
    "sec_run": [],
    "result": [],
    "player_no": [],
    "last_name": [],
    "active": []
}
var tbl_metrics = {
    "index": [],
    "period": [],
    "timestamp": [],
    "min_run": [],
    "sec_run": [],
    "team": [],
    "metric": [],
    "result": [],
    "total_home": [],
    "total_away": []
}
var tbl_period = {
    "Rotations": [],
    "Play Time": [],
    "Rest Time": [],
    "W/R Ratio": [],
    "% Total Time": []
}
function addMatchTableSection() {
    tbl_period.Rotations.push([])
    tbl_period["Play Time"].push([])
    tbl_period["Rest Time"].push([])
    tbl_period["W/R Ratio"].push([])
    tbl_period["% Total Time"].push([])
    for (p=0; p<(struct_general.nplay); p++) {
        tbl_period.Rotations[struct_general.nper].push(0)
        tbl_period["Play Time"][struct_general.nper].push(0)
        tbl_period["Rest Time"][struct_general.nper].push(0)
        tbl_period["W/R Ratio"][struct_general.nper].push(1.00)
        tbl_period["% Total Time"][struct_general.nper].push(0)
    }
}
function addTablePeriodSection() {
    struct_general.nper++;
    struct_general.per_time.push(0)
    tbl_period.Rotations.push([])
    tbl_period["Play Time"].push([])
    tbl_period["Rest Time"].push([])
    tbl_period["W/R Ratio"].push([])
    tbl_period["% Total Time"].push([])
    for (p=0; p<(struct_general.nplay); p++) {
        tbl_period.Rotations[struct_general.nper].push(0)
        tbl_period["Play Time"][struct_general.nper].push(0)
        tbl_period["Rest Time"][struct_general.nper].push(0)
        tbl_period["W/R Ratio"][struct_general.nper].push(1.00)
        tbl_period["% Total Time"][struct_general.nper].push(0)
    }
}
//#endregion
//#endregion

//#region Clock Functions
clockKickOff.onclick = function() {
    addTablePeriodSection()
    struct_time["period"]++;
    clockPer.innerHTML = struct_time["period"];

    // Set kickoff for 1st period
    if (struct_time.period==1) {
        struct_match.kickoff = new Date(Date.now())
    }

    for (p=0; p<struct_general.nplay; p++) {
        if (struct_team.players[p].active==1) {
            tbl_period.Rotations[struct_time.period][p] = 1;
            tbl_period.Rotations[0][p] += 1;
        } else {
            tbl_period.Rotations[struct_time.period][p] = 0;
        }
        struct_team.players[p].tplay = 0;
        struct_team.players[p].trest = 0;
    }
    updateLiveVis();

    clearInterval(IntervalM);
    IntervalM = setInterval(startMain, 1000);

    // Update Line-Up
    for (var i = 0; i<struct_team.players.length; i++) {
        if (struct_team.players[i].active==1) {
            var timeMain = parseClock(struct_time["clock_main"],0);
            tbl_match["index"].push(i+1);
            tbl_match["period"].push(struct_time["period"]);
            tbl_match["timestamp"].push(new Date(Date.now()))
            tbl_match["min_run"].push(timeMain[0]);
            tbl_match["sec_run"].push(timeMain[1]);
            tbl_match["result"].push("lineup");
            tbl_match["player_no"].push(struct_team["players"][i]["pno"]);
            tbl_match["last_name"].push(struct_team["players"][i]["nlast"]);
            tbl_match["active"].push(true);
        }
    }
    // Update Match Table
    updateTime();
    var timeMain = parseClock(struct_time["clock_main"],0);
    tbl_match["index"].push(tbl_match["index"].length + 1)
    tbl_match["period"].push(struct_time["period"]);
    tbl_match["timestamp"].push(new Date(Date.now()))
    tbl_match["min_run"].push(timeMain[0]);
    tbl_match["sec_run"].push(timeMain[1]);
    tbl_match["result"].push("kick off");
    tbl_match["player_no"].push(-1);
    tbl_match["last_name"].push("");
    tbl_match["active"].push("");

    // Toggles
    struct_time["kickofftgl"] = 1;
    // Button Enables
    buttonEnable(clockKickOff, false)
    buttonEnable(clockBreak, true)
    buttonEnable(btnExport, false)
    toggleMatch(true)
    toggleMetrics(true)
    togglePlayers(true)
    // Button Aesthetics
    clockPer.classList.remove('break');
    clockMain.classList.remove('break');
}
clockBreak.onclick = function() {
    clearInterval(IntervalM);

    // Update Match Table
    updateTime();
    var timeMain = parseClock(struct_time["clock_main"],0);
    tbl_match["index"].push(tbl_match["index"].length + 1)
    tbl_match["period"].push(struct_time["period"]);
    tbl_match["timestamp"].push(new Date(Date.now()))
    tbl_match["min_run"].push(timeMain[0]);
    tbl_match["sec_run"].push(timeMain[1]);
    tbl_match["result"].push("break");
    tbl_match["player_no"].push(-1);
    tbl_match["last_name"].push("");
    tbl_match["active"].push(false);

    minutesM = "0";
    secondsM = "0";
    displayClock(clockMain, minutesM, secondsM, 0, struct_time.period)

    // Toggles
    struct_time["kickofftgl"] = 0;
    struct_time["pausetgl"] = 0;
    struct_time["stoptgl"] = 0;
    // Button Enables
    buttonEnable(clockKickOff, true)
    buttonEnable(clockBreak, false)
    buttonEnable(btnExport, true)
    toggleMatch(false)
    toggleMetrics(false)
    // Button Aesthetics
    clockPer.classList.add('break');
    clockMain.classList.add('break');
    clockMain.classList.remove('pause');
}

function startMain() {
    secondsM++;
    // Update Period Time
    struct_general.per_time[struct_general.nper-1]++;
    
    if (secondsM > 59) {
        minutesM++;
        secondsM = 0;
    }
    for (i=0; i<struct_team.players.length; i++) {
        if (struct_team.players[i].active==1) {
            struct_team.players[i].tplay++;
            struct_team.players[i].totplay++;
            tbl_period["Play Time"][struct_time.period][i]++;
            tbl_period["Play Time"][0][i]++;
        } else {
            struct_team.players[i].trest++;
            struct_team.players[i].totrest++;
            tbl_period["Rest Time"][struct_time.period][i]++;
            tbl_period["Rest Time"][0][i]++;
        }
        updateWRPer(i)
    }
    updateLiveVis()
    updateAnlUITable()
    displayClock(clockMain, minutesM, secondsM, 0, struct_time.period-1)
}
function displayClock(clockTxt, minutes, seconds, mode, per) {
    // mode: 0 - Main Clock, 1 - Play Clock
    if (mode==0) {
        var minutesTxt = parseInt(minutes)
        var secondsTxt = parseInt(seconds)
        if(minutes<=9){
            minutesTxt = "0" + parseInt(minutes)
        }
        if(seconds<=9){
            secondsTxt = "0" + parseInt(seconds)
        }
        clockTxt.innerHTML = minutesTxt + ":" + secondsTxt;
    }
}
function parseClock(clockTxt, mode) {
    // 0: Main Clock, 1: Play Clock
    if (mode==0) {
        clockArr = clockTxt.split(":");
        minutes = clockArr[0];
        seconds = clockArr[1];
    }

    return [minutes, seconds]
}
function setClock(seconds) {
    minutes = Math.floor(seconds/60);
    sec = seconds - 60*minutes;
    if (minutes<10) {
        minutes = "0"+minutes;
    }
    if (sec<10) {
        sec = "0" + sec;
    }
    return minutes + ":" + sec
}
function updateTime() {
    struct_time["clock_main"] = clockMain.innerHTML;
    struct_time["period"] = clockPer.innerHTML;
}
//#endregion

//#region Analysis
function updateAnlUITable() {
    tblAnl.innerHTML = "";
    
    var table = "";
    var metrics = Object.keys(tbl_period); // Rotations, Play Time, Rest Time, W/R
    var cols = struct_team.players.length;

    // METRIC COLOR SCHEME
    metCol = [  [104,108,115,24,160,251],
                [104,108,115,240,65,80], // Play Time: Slate -> Red
                [104,108,115,79,191,111], // Rest Time: Slate -> Green
                [79,191,111,24,160,251,240,65,80], // WR Ratio: Green -> Blue --> Red
                [104,108,115,24,160,251]    ] // % of Period Played: Slate -> Blue

    // TEAM ROW
    table += "<tr>";
    table += "<th style='background-color:black; text-align: right'>Team &nbsp &nbsp</th>";
    for (c=0; c<cols; c++) {
        table += "<th style='background-color:black'>" + struct_team.players[c].nlast + "</th>";
    }
    table += "</tr>";
    table = addRowSpace(table);
    // DATA ROWS
    for (var p=0; p<=struct_general.nper; p++) {
        for (m=0; m<metrics.length; m++) {
            table += "<tr>";
            if (p==0) {
                table += "<th style='background-color:black; text-align: right'>Match " + metrics[m] +" &nbsp &nbsp</th>";
            } else {
                table += "<th style='background-color:black; text-align: right'>P" + (p) + "_" + metrics[m] +" &nbsp &nbsp</th>";
            }

            for (c=0; c<cols; c++) {
                cellData = tbl_period[metrics[m]][p][c]
                // GET METRIC FORMAT
                if (m==1 || m==2) { // Play/Rest Time
                    cellData = setClock(cellData)
                } else if (m==4) { // % Played
                    cellData += "%"
                }
                cCol = 'black'
                if (m==3) {
                    cCol = getCellColorWR(tbl_period[metrics[m]][p][c], metCol[m])
                } else {
                    cCol = getCellColor(tbl_period[metrics[m]][p], c, metCol[m])
                }

                table += "<th style=" + 
                "'background-color:" + cCol + ";" + 
                "color:var(--grey6);" + 
                "'>" + cellData + "</th>"
            }
            table += "</tr>";
        }
        table = addRowSpace(table);
        tblAnl.innerHTML = table;
    }

    function addRowSpace(table) {
        table += "<tr>";
        table += "<th style='background-color:var(--slate1)'></th>";
        for (c=0; c<cols; c++) {
            table += "<th style='background-color:var(--slate1)'></th>";
        }
        table += "</tr>";

        return table;
    }
}
function getCellColor(dataArr, idx, rgb) {
    rVal = rgb[0]+(rgb[3]-rgb[0])*(dataArr[idx] / (Math.max(...dataArr)+0.01));
    gVal = rgb[1]+(rgb[4]-rgb[1])*(dataArr[idx] / (Math.max(...dataArr)+0.01));
    bVal = rgb[2]+(rgb[5]-rgb[2])*(dataArr[idx] / (Math.max(...dataArr)+0.01));

    return "rgb(" + rVal + "," + gVal + "," + bVal + ")"
}
function getCellColorWR(wr, rgbGBR) {
    rgb = [rgbGBR[3], rgbGBR[4], rgbGBR[5]];
    if (wr<0.9) {
        rgb = [rgbGBR[0], rgbGBR[1], rgbGBR[2]];
    } else if (wr>1.1) {
        rgb = [rgbGBR[6], rgbGBR[7], rgbGBR[8]];
    }
    return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")"
}
function getVisColorWR(wr, rgbGBR) {
    rgb = [rgbGBR[3], rgbGBR[4], rgbGBR[5]];
    if (wr<0.9) {
        rgb = [rgbGBR[0], rgbGBR[1], rgbGBR[2]];
    } else if (wr>1.1) {
        rgb = [rgbGBR[6], rgbGBR[7], rgbGBR[8]];
    }
    return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")"
}
function updateLiveVis() {
    if (struct_general.nper>0) {
        colG = [200,200,200,79,191,111];
        colR = [200,200,200,249,92,80];
        colGBR = [79,191,111,24,160,251,249,92,80];

        perno = struct_time.period;
        if (perno==0) {
            perno=1;
        }
        tPlayDat = getKeyArray(struct_team.players, "tplay")
        tRestDat = getKeyArray(struct_team.players, "trest")
        for (i=1; i<=struct_general.nplay; i++) {
            // GET CLOCK COLOR
            txtRot = document.getElementById("rot" + i);
            txtRot.innerHTML = tbl_period.Rotations[perno][i-1];

            txtClock = document.getElementById("time" + i);
            clockDat = struct_team.players[i-1].tplay;
            cCol = getCellColor(tPlayDat, i-1, colG)
            if (struct_team.players[i-1].active==0) {
                clockDat = struct_team.players[i-1].trest;
                cCol = getCellColor(tRestDat, i-1, colR)
            }
            txtClock.innerHTML = setClock(clockDat);
            txtClock.style.color = cCol;

            wrRatio = Math.round(10*struct_team.players[i-1].tplay / (struct_team.players[i-1].trest+1))/10;
            if (wrRatio>=1) {
                wrRatio = 2 - Math.round(10*struct_team.players[i-1].trest / (struct_team.players[i-1].tplay+1))/10;
            }
            txtWR = document.getElementById("wr" + i);
            txtWR.innerHTML = wrRatio;
            txtWR.style.color = getVisColorWR(wrRatio, colGBR);

            txtTP = document.getElementById("tp" + i);
            txtTP.innerHTML = setClock(struct_team.players[i-1].tplay);
            txtTR = document.getElementById("tr" + i);
            txtTR.innerHTML = setClock(struct_team.players[i-1].trest);
        }
    }
}
function updateWRPer(pno) {
    tplay = tbl_period["Play Time"][struct_time.period][pno];
    trest = tbl_period["Rest Time"][struct_time.period][pno];
    wrRatio = Math.round(100*tplay / (trest+1))/100;
    perPlay = 100*Math.round(100*tplay / struct_general.per_time[struct_time.period-1])/100;

    tbl_period["W/R Ratio"][struct_time.period][pno] = wrRatio;
    tbl_period["% Total Time"][struct_time.period][pno] = perPlay;

    // MATCH
    tplayM = tbl_period["Play Time"][0][pno];
    trestM = tbl_period["Rest Time"][0][pno];
    timeM = struct_general.per_time.reduce((a, b) => a + b, 0)
    wrRatioM = Math.round(100*tplayM / (trestM+1))/100;
    perPlayM = 100*Math.round(100*tplayM / timeM)/100;

    tbl_period["W/R Ratio"][0][pno] = wrRatioM;
    tbl_period["% Total Time"][0][pno] = perPlayM;
}

//#endregion

//#region Team Actions+Passing
function toggleActive(pID){
    el = document.getElementById("play" + (pID));
    perno = struct_time["period"];

    // Determine sub on or sub off
    var toggleActive = true
    var sub_string = "";
    if (struct_team.players[pID-1].active==0) {
        struct_team["players"][pID-1]["active"] = 1;
        el.classList.add('active');
        if (perno>0) {
            // Update Live Analysis Table
            tbl_period.Rotations[perno][pID-1] += 1;
            // Update Match Table Section
            tbl_period.Rotations[0][pID-1] += 1;
        }
        // Update Live Vis
        struct_team.players[pID-1].tplay = 0;
        // Set substitution string
        sub_string = "sub on";
    } else if (struct_team.players[pID-1].active==1) {
        toggleActive = false
        struct_team["players"][pID-1]["active"] = 0;
        el.classList.remove('active');
        // Update Live Vis
        struct_team.players[pID-1].trest = 0;
        sub_string = "sub off";
    }
    
    // Update Match Table
    if (struct_time.kickofftgl==1) {
        updateTime();
        var timeMain = parseClock(struct_time["clock_main"],0);
        tbl_match["index"].push(tbl_match["index"].length + 1);
        tbl_match["period"].push(struct_time["period"]);
        tbl_match["timestamp"].push(new Date(Date.now()))
        tbl_match["min_run"].push(timeMain[0]);
        tbl_match["sec_run"].push(timeMain[1]);
        tbl_match["result"].push(sub_string);
        tbl_match["player_no"].push(struct_team["players"][pID-1]["pno"]);
        tbl_match["last_name"].push(struct_team["players"][pID-1]["nlast"]);
        tbl_match["active"].push(toggleActive)
    }
    updateLiveVis();
    updateAnlUITable();
}

btnP1.onclick = function(){toggleActive(1)}
btnP2.onclick = function(){toggleActive(2)}
btnP3.onclick = function(){toggleActive(3)}

function addGoal(lbl) {
    updateTime()
    var timeMain = parseClock(struct_time["clock_main"],0);
    tbl_match["index"].push(tbl_match["index"].length + 1);
    tbl_match["period"].push(struct_time["period"]);
    tbl_match["timestamp"].push(new Date(Date.now()))
    tbl_match["min_run"].push(timeMain[0]);
    tbl_match["sec_run"].push(timeMain[1]);
    tbl_match["result"].push(lbl);
    tbl_match["player_no"].push(-1);
    tbl_match["last_name"].push("");
    tbl_match["active"].push("");
}

//#endregion

//#region Metrics
function addMetric(team, metric, result, total) {
    updateTime();
    var timeMain = parseClock(struct_time["clock_main"],0);
    tbl_metrics["index"].push(tbl_metrics["index"].length + 1);
    tbl_metrics["period"].push(struct_time["period"]);
    tbl_metrics["timestamp"].push(new Date(Date.now()))
    tbl_metrics["min_run"].push(timeMain[0]);
    tbl_metrics["sec_run"].push(timeMain[1]);
    tbl_metrics["team"].push(team);
    tbl_metrics["metric"].push(metric);
    tbl_metrics["result"].push(result);
    tbl_metrics["total_home"].push(total[0]);
    tbl_metrics["total_away"].push(total[1]);
}

function metricChange(metricNo, teamNo, result, metVal, metLbl) {
    // Update metric labels
    struct_general.metric_name[metricNo] = metLbl.innerHTML;
    if (result > 0) {
        metVal.innerHTML = Number(metVal.innerHTML) + result; // Update HTML value label
        struct_general.metric_val[metricNo][teamNo] = metVal.innerHTML; // Update structure value        
        addMetric(struct_match.teams[teamNo], struct_general.metric_name[metricNo], result, struct_general.metric_val[metricNo])
    } else {
        if (metVal.innerHTML > 0) {
            metVal.innerHTML = Number(metVal.innerHTML) + result; // Update HTML value label
            struct_general.metric_val[metricNo][teamNo] = metVal.innerHTML; // Update structure value        
            addMetric(struct_match.teams[teamNo], struct_general.metric_name[metricNo], result, struct_general.metric_val[metricNo])
        }
    }
    updateScore();
}

function updateScore() {
    // Home
    scoreH = Number(btnM1ValH.innerHTML) + Number(btnM2ValH.innerHTML) + Number(btnM3ValH.innerHTML)
    txtHScore.innerHTML = scoreH
    // Away
    scoreA = Number(btnM1ValA.innerHTML) + Number(btnM2ValA.innerHTML) + Number(btnM3ValA.innerHTML)
    txtAScore.innerHTML = scoreA

    // update score
    struct_match.score = [scoreH, scoreA]
    console.log(struct_match)
}

btnM1PosH.onclick = function() {
    metricChange(0,0,6,btnM1ValH,btnM1Lbl);
}
btnM1NegH.onclick = function() {
    metricChange(0,0,-6,btnM1ValH,btnM1Lbl);
}
btnM1PosA.onclick = function() {
    metricChange(0,1,6,btnM1ValA,btnM1Lbl);
}
btnM1NegA.onclick = function() {
    metricChange(0,1,-6,btnM1ValA,btnM1Lbl);
}
btnM2PosH.onclick = function() {
    metricChange(1,0,2,btnM2ValH,btnM2Lbl);
}
btnM2NegH.onclick = function() {
    metricChange(1,0,-2,btnM2ValH,btnM2Lbl);
}
btnM2PosA.onclick = function() {
    metricChange(1,1,2,btnM2ValA,btnM2Lbl);
}
btnM2NegA.onclick = function() {
    metricChange(1,1,-2,btnM2ValA,btnM2Lbl);
}
btnM3PosH.onclick = function() {
    metricChange(2,0,1,btnM3ValH,btnM3Lbl);
}
btnM3NegH.onclick = function() {
    metricChange(2,0,-1,btnM3ValH,btnM3Lbl);
}
btnM3PosA.onclick = function() {
    metricChange(2,1,1,btnM3ValA,btnM3Lbl);
}
btnM3NegA.onclick = function() {
    metricChange(2,1,-1,btnM3ValA,btnM3Lbl);
}

//#endregion

//#region Export Data
function pushSheet(wb, name, data) {
    var ws = XLSX.utils.aoa_to_sheet(data);
    wb.SheetNames.push(name);
    wb.Sheets[name] = ws;

    return wb
}
function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
}

btnExport.onclick = function() {
    var head;
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "BreakAway Time: CFL",
        Author: "Sport Performance Analytics Inc.",
        CreatedDate: new Date()
    };

    // Match Info Tab
    var dataMatchInfo = [];
    // Header
    dataMatchInfo.push(["Team Analyzed", "Date", "Location", "Competition", "Stage", "KickOff",
    "Home Team", "Away Team", "Home Initials", "Away Initials", "Goals (Home)", "Goals (Away)"]);
    dataMatchInfo.push([struct_team["name"], struct_match["date"], struct_match["location"], struct_match["competition"],
    struct_match["stage"], struct_match["kickoff"], struct_match["teams"][0], struct_match["teams"][1],
    struct_match["initials"][0], struct_match["initials"][1], struct_match["score"][0], struct_match["score"][1]]);

    // Team Info Tab
    var dataTeamInfo = [];
    // Header
    dataTeamInfo.push(["Player ID", "Player No", "First Name", "Last Name", "Position"]);
    // Data
    for (var row=0; row<struct_team["players"].length; row++) {
        dataTeamInfo.push([
            struct_team["players"][row]["pid"],
            struct_team["players"][row]["pno"],
            struct_team["players"][row]["nfirst"],
            struct_team["players"][row]["nlast"],
            struct_team["players"][row]["position"]
        ]);
    }

    // Match Events Tab
    var dataMatchEvents = [];
    // Header
    dataMatchEvents.push(Object.keys(tbl_match));
    // Data
    if (tbl_match["index"].length > 0) {
        for (var row=0; row<tbl_match["index"].length; row++) {
            var datarow = [];
            for (var col=0; col<Object.keys(tbl_match).length; col++) {
                datarow.push(tbl_match[Object.keys(tbl_match)[col]][row])
            }
            dataMatchEvents.push(datarow.slice());
        }
    }

    // Metrics Tab
    var dataMetrics = [];
    // Header
    dataMetrics.push(Object.keys(tbl_metrics));
    // Data
    if (tbl_metrics["index"].length > 0) {
        for (var row=0; row<tbl_metrics["index"].length; row++) {
            var datarow = [];
            for (var col=0; col<Object.keys(tbl_metrics).length; col++) {
                datarow.push(tbl_metrics[Object.keys(tbl_metrics)[col]][row])
            }
            dataMetrics.push(datarow.slice());
        }
    }

    // Playing Stats Tab
    var dataPlayEvents = [];
    var metrics = Object.keys(tbl_period); // Rotations, Play Time, Rest Time, W/R
    // Header
    var headerrow = []
    headerrow.push('Jersey #')
    headerrow.push('Display Name')
    for (p=0; p<struct_general.nper; p++) {
        for (m=0; m<metrics.length; m++) {
            headerrow.push('P' + (p+1) + '_' + metrics[m])
        }
    }
    dataPlayEvents.push(headerrow)
    // Data
    for (i=0; i<struct_team.players.length; i++) {
        var datarow = [];
        datarow.push(struct_team.players[i].pno)
        datarow.push(struct_team.players[i].nlast)
        for (p=0; p<struct_general.nper; p++) {
            for (m=0; m<metrics.length; m++) {
                if (metrics[m]=="% Total Time") {
                    datarow.push(tbl_period[metrics[m]][p][i] + ".0")
                } else {
                    datarow.push(tbl_period[metrics[m]][p][i])
                }
            }
        }
        dataPlayEvents.push(datarow.slice());
    }

    wb = pushSheet(wb, "Match Info", dataMatchInfo);
    wb = pushSheet(wb, "Team Info", dataTeamInfo);
    wb = pushSheet(wb, "Match Events", dataMatchEvents);
    wb = pushSheet(wb, "Metrics", dataMetrics);
    wb = pushSheet(wb, "Playing Stats", dataPlayEvents);

    // Export
    var fileName = "BATime_CFL_" + struct_match["date"] + ".xlsx";
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), fileName);
};
//#endregion

//#region UI SET
window.onload = function() {
    addMatchTableSection();
    toggleMatch(false);
    toggleMetrics(false);
    buttonEnable(clockBreak, false);
    buttonEnable(btnExport, false);
    updateAnlUITable();
    updateLiveVis();

    // set date
    var m = new Date();
    dateString = m.getFullYear() + "-" + ("0" + (m.getMonth()+1)).slice(-2) + "-" + ("0" + m.getDate()).slice(-2)

    struct_match.date = dateString // Y, M, D
}
//#endregion

function buttonEnable(button, tgl) {
    if (tgl) {
        button.disabled = false;
        button.classList.remove('disabled');
    } else {
        button.disabled = true;
        button.classList.add('disabled');
    }
}
function togglePlayers(tgl) {
    var prefix = 'play';
    for(var i = 1; i<=struct_general.nplay; i++) {
        el = document.getElementById(prefix + i);
        buttonEnable(el, tgl)
    }
    var prefix = 'btn';
    for(var i = 1; i<=struct_general.nplay; i++) {
        el = document.getElementById(prefix + i);
        buttonEnable(el, tgl)
    }
}
function toggleMatch(tgl) {
    if (tgl==false) {
        txtHScore.classList.add("break");
        txtAScore.classList.add("break");
    } else {
        txtHScore.classList.remove("break");
        txtAScore.classList.remove("break");
    }
}
function toggleMetrics(tgl) {
    buttonEnable(btnM1PosH, tgl);
    buttonEnable(btnM1PosA, tgl);
    buttonEnable(btnM1NegH, tgl);
    buttonEnable(btnM1NegA, tgl);
    buttonEnable(btnM2PosH, tgl);
    buttonEnable(btnM2PosA, tgl);
    buttonEnable(btnM2NegH, tgl);
    buttonEnable(btnM2NegA, tgl);
    buttonEnable(btnM3PosH, tgl);
    buttonEnable(btnM3PosA, tgl);
    buttonEnable(btnM3NegH, tgl);
    buttonEnable(btnM3NegA, tgl);
    if (tgl==false) {
        btnM1ValH.classList.add("break");
        btnM1ValA.classList.add("break");
        btnM2ValH.classList.add("break");
        btnM2ValA.classList.add("break");
        btnM3ValH.classList.add("break");
        btnM3ValA.classList.add("break");
    } else {
        btnM1ValH.classList.remove("break");
        btnM1ValA.classList.remove("break");
        btnM2ValH.classList.remove("break");
        btnM2ValA.classList.remove("break");
        btnM3ValH.classList.remove("break");
        btnM3ValA.classList.remove("break");
    }
}
function getKeyArray(dictname, keyname) {
    var valueArray = [];
    for (i=0; i<dictname.length; i++) {
        valueArray.push(dictname[i][keyname])
    }

    return valueArray
}
function getAllIndexes(arr, val) {
    var indexes = [];
    for(var i = 0; i < arr.length; i++)
        if (arr[i] == val)
            indexes.push(i);
    return indexes;
}
