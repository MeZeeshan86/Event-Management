const $ = id => document.getElementById(id);
const KEY = "campusconnect_demo_v1";
const initialEvents = [
 {id:"EVT101",title:"AI & Innovation Summit",category:"Technology",date:"2027-01-18",venue:"Auditorium A"},
 {id:"EVT102",title:"Web Development Workshop",category:"Workshop",date:"2027-01-22",venue:"Computer Lab 2"},
 {id:"EVT103",title:"Annual Cultural Fest",category:"Cultural",date:"2027-02-05",venue:"Open Ground"},
 {id:"EVT104",title:"Inter-College Sports Meet",category:"Sports",date:"2027-02-12",venue:"Sports Complex"}
];
const load=()=>{const d=JSON.parse(localStorage.getItem(KEY)||"null");if(d)return d;const fresh={students:[],events:initialEvents,registrations:[]};localStorage.setItem(KEY,JSON.stringify(fresh));return fresh;};
const save=d=>localStorage.setItem(KEY,JSON.stringify(d));
let currentUser=null;
function notify(msg,type="success"){$("message").textContent=msg;$("message").className="notice "+type;$("message").classList.remove("hidden");}
function clearNotify(){$("message").classList.add("hidden");}
function setView(v){
 $("authSection").classList.toggle("hidden",v!=="guest");$("studentApp").classList.toggle("hidden",v!=="student");$("adminApp").classList.toggle("hidden",v!=="admin");
 $("sessionArea").textContent=currentUser?`${currentUser.name} · ${currentUser.role}`:"Guest";
 if(v==="student")renderEvents();if(v==="admin")renderAdmin();
}
$("registerForm").addEventListener("submit",ev=>{
 ev.preventDefault();clearNotify();
 const name=$("regName").value.trim(),email=$("regEmail").value.trim().toLowerCase(),password=$("regPassword").value,db=load();
 if(db.students.some(s=>s.email===email)){notify("This email is already registered.","error");return;}
 db.students.push({name,email,password});save(db);$("registerForm").reset();notify("Student registration successful. Please log in.");
});
$("loginForm").addEventListener("submit",ev=>{
 ev.preventDefault();clearNotify();const email=$("loginEmail").value.trim().toLowerCase(),password=$("loginPassword").value;
 if(email==="admin@events.test"&&password==="admin123"){currentUser={name:"Event Admin",email,role:"admin"};setView("admin");return;}
 const s=load().students.find(x=>x.email===email&&x.password===password);
 if(!s){notify("Invalid email or password.","error");return;}currentUser={...s,role:"student"};setView("student");
});
function logout(){currentUser=null;setView("guest");notify("You have logged out.");}
$("logoutBtn").addEventListener("click",logout);$("adminLogout").addEventListener("click",logout);
function renderEvents(){
 const q=$("eventSearch").value.toLowerCase(),cat=$("categoryFilter").value,db=load();
 const rows=db.events.filter(x=>(!cat||x.category===cat)&&(`${x.title} ${x.category}`.toLowerCase().includes(q)));
 $("eventList").innerHTML=rows.length?rows.map(x=>`<article class="item"><div><h4>${x.title}</h4><p>${x.category} · ${x.date}</p><p>${x.venue}</p></div><button data-register="${x.id}">Register</button></article>`).join(""):'<div class="empty">No events match your search.</div>';
 document.querySelectorAll("[data-register]").forEach(b=>b.addEventListener("click",()=>registerEvent(b.dataset.register)));
}
$("eventSearch").addEventListener("input",renderEvents);$("categoryFilter").addEventListener("change",renderEvents);
function registerEvent(id){
 const db=load(),event=db.events.find(x=>x.id===id);
 if(db.registrations.some(r=>r.eventId===id&&r.studentEmail===currentUser.email)){notify("You are already registered for this event.","error");return;}
 db.registrations.push({id:"REG"+Date.now(),eventId:id,eventTitle:event.title,studentName:currentUser.name,studentEmail:currentUser.email,date:event.date,venue:event.venue,status:"Confirmed"});
 save(db);notify(`Registration confirmed for ${event.title}.`);renderEvents();
}
function renderMine(){
 const rows=load().registrations.filter(r=>r.studentEmail===currentUser.email);
 $("myRegistrations").innerHTML=rows.length?rows.map(r=>`<article class="item"><div><h4>${r.eventTitle}</h4><p>${r.date} · ${r.venue}</p><span class="pill">${r.status}</span></div></article>`).join(""):'<div class="empty">You have not registered for any events.</div>';
}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));
 $("eventsPanel").classList.toggle("hidden",b.dataset.tab!=="events");$("minePanel").classList.toggle("hidden",b.dataset.tab!=="mine");
 if(b.dataset.tab==="mine")renderMine();
}));
$("eventForm").addEventListener("submit",ev=>{
 ev.preventDefault();const db=load(),title=$("eventTitle").value.trim(),date=$("eventDate").value,venue=$("eventVenue").value.trim();
 if(date<new Date().toISOString().slice(0,10)){notify("Event date must be today or in the future.","error");return;}
 db.events.push({id:"EVT"+Date.now(),title,category:$("eventCategory").value,date,venue});save(db);$("eventForm").reset();notify("Event added successfully.");renderAdmin();
});
function renderAdmin(){
 const db=load();
 const events=db.events.map(x=>`<article class="item"><div><h4>${x.title}</h4><p>${x.category} · ${x.date} · ${x.venue}</p></div><span class="pill">${db.registrations.filter(r=>r.eventId===x.id).length} participants</span></article>`).join("");
 const regs=db.registrations.length?`<table><thead><tr><th>Student</th><th>Email</th><th>Event</th><th>Status</th></tr></thead><tbody>${db.registrations.map(r=>`<tr><td>${r.studentName}</td><td>${r.studentEmail}</td><td>${r.eventTitle}</td><td>${r.status}</td></tr>`).join("")}</tbody></table>`:'<div class="empty">No registrations yet.</div>';
 $("adminRegistrations").innerHTML=events+`<h3 style="margin-top:22px">Participant list</h3>`+regs;
}
load();setView("guest");
