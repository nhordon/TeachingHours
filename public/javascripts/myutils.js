
function selectGroup() {
  let x = document.getElementById("groupid").value;
 
  document.getElementById("upgroup").href = "/edit_navt/insertfromhoursgroup/" + x;

}


function arrayToMap(arr, keyfeild,valuefeild1)
{
  let map = {};
for(let i=0; i<arr.length; i++) {
    if(arr[i][keyfeild] in map) {
        map[arr[i][keyfeild]].push(arr[i][valuefeild1]);
       
    } else {
        map[arr[i][keyfeild]] = [arr[i][valuefeild1]];
       
    }
}
return map;
}
  
function arrayObjToObjects(a1){

 const abrcounts = a1.reduce((acc, value) => ({
  ...acc,
  [value.abr]: (acc[value.abr] || 0) + 1
}), {});
 

let all=0;
for(abr in abrcounts){
  let count=abrcounts[abr];
  abrcounts[abr]=[];

  for(let i=all; i<count+all;i++)
  {
      let obj={};
  
      obj.subjectname = a1[i].subjectname;
      obj.groupname=a1[i].groupname;
      abrcounts[abr].push(obj);
  }
  all+=count;
  let map={};
  for(let i=0; i<count;i++)
  {
 
      map=arrayToMap(abrcounts[abr], 'subjectname','groupname');
   
  }
  if(map){
      abrcounts[abr]={...map}; 
  
   }
}
 
return abrcounts;

}