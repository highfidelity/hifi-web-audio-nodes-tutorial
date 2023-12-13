function setbuttonname(names){
  object0name.innerHTML = names[0];
  object1name.innerHTML = names[1];
  object2name.innerHTML = names[2];
  object3name.innerHTML = names[3];
  object4name.innerHTML = names[4];
}

export default function setupButtons(document, names) {
  const object0name = document.getElementById('object0name');
  const object1name = document.getElementById('object1name');
  const object2name = document.getElementById('object2name');
  const object3name = document.getElementById('object3name');
  const object4name = document.getElementById('object4name');
  function setbuttonname(names){
    object0name.innerHTML = names[0];
    object1name.innerHTML = names[1];
    object2name.innerHTML = names[2];
    object3name.innerHTML = names[3];
    object4name.innerHTML = names[4];
  }
  const xInput0 = document.getElementById('x1');
  const yInput0 = document.getElementById('y1');
  const zInput0 = document.getElementById('z1');

  const xInput1 = document.getElementById('x2');
  const yInput1 = document.getElementById('y2');
  const zInput1 = document.getElementById('z2');

  const xInput2 = document.getElementById('x3');
  const yInput2 = document.getElementById('y3');
  const zInput2 = document.getElementById('z3');

  const xInput3 = document.getElementById('x4');
  const yInput3 = document.getElementById('y4');
  const zInput3 = document.getElementById('z4');

  const xInput4 = document.getElementById('x5');
  const yInput4 = document.getElementById('y5');
  const zInput4 = document.getElementById('z5');

  let counter = document.getElementById('counter');
  function changecounter(){
    let x1 = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    counter.setAttribute('value', x1 );
  }

  xInput0.addEventListener('change', () => {
    changecounter();});
  yInput0.addEventListener('change', () => {
    changecounter();})
  zInput0.addEventListener('change', () => { 
    changecounter();})
  xInput1.addEventListener('change', () => {
    changecounter();})
  yInput1.addEventListener('change', () => {
    changecounter();})
  zInput1.addEventListener('change', () => {    
    changecounter();} )
  xInput2.addEventListener('change', () => {
    changecounter();})
  yInput2.addEventListener('change', () => {
    changecounter();})
  zInput2.addEventListener('change', () => {
    changecounter();})
  xInput3.addEventListener('change', () => {
    changecounter();})
  yInput3.addEventListener('change', () => {
    changecounter();})
  zInput3.addEventListener('change', () => {
    changecounter();})
  xInput4.addEventListener('change', () => {
    changecounter();})
  yInput4.addEventListener('change', () => {
    changecounter();})
  zInput4.addEventListener('change', () => {
    changecounter();})

  setbuttonname(names)
  return {
    xInput0,
    yInput0,
    zInput0,
    xInput1,
    yInput1,
    zInput1,
    xInput2,
    yInput2,
    zInput2,
    xInput3,
    yInput3,
    zInput3,
    xInput4,
    yInput4,
    zInput4,
  };
}