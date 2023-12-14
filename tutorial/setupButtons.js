function setbuttonname(names){
  object0name.innerHTML = names[0];
  object1name.innerHTML = names[1];
  object2name.innerHTML = names[2];
  object3name.innerHTML = names[3];
  object4name.innerHTML = names[4];
}

export default function setupButtons(document, names, positions) {
  const object0name = document.getElementById('object0name');
  const object1name = document.getElementById('object1name');
  const object2name = document.getElementById('object2name');
  const object3name = document.getElementById('object3name');
  const object4name = document.getElementById('object4name');
  const objecthuman = document.getElementById('human');
  function setbuttonname(names){
    object0name.innerHTML = names[0];
    object1name.innerHTML = names[1];
    object2name.innerHTML = names[2];
    object3name.innerHTML = names[3];
    object4name.innerHTML = names[4];
  }
  const xHuman = document.getElementById('xhuman');
  const yHuman = document.getElementById('yhuman');
  const zHuman = document.getElementById('zhuman');

  const xInput0 = document.getElementById('x1');
  const yInput0 = document.getElementById('y1');
  const zInput0 = document.getElementById('z1');

  xInput0.setAttribute('value', positions[0].x);
  yInput0.setAttribute('value', positions[0].y);
  zInput0.setAttribute('value', positions[0].z);

  const xInput1 = document.getElementById('x2');
  const yInput1 = document.getElementById('y2');
  const zInput1 = document.getElementById('z2');

  xInput1.setAttribute('value', positions[1].x);
  yInput1.setAttribute('value', positions[1].y);
  zInput1.setAttribute('value', positions[1].z);

  const xInput2 = document.getElementById('x3');
  const yInput2 = document.getElementById('y3');
  const zInput2 = document.getElementById('z3');

  xInput2.setAttribute('value', positions[2].x);
  yInput2.setAttribute('value', positions[2].y);
  zInput2.setAttribute('value', positions[2].z);

  const xInput3 = document.getElementById('x4');
  const yInput3 = document.getElementById('y4');
  const zInput3 = document.getElementById('z4');

  xInput3.setAttribute('value', positions[3].x);
  yInput3.setAttribute('value', positions[3].y);
  zInput3.setAttribute('value', positions[3].z);

  const xInput4 = document.getElementById('x5');
  const yInput4 = document.getElementById('y5');
  const zInput4 = document.getElementById('z5');

  xInput4.setAttribute('value', positions[4].x);
  yInput4.setAttribute('value', positions[4].y);
  zInput4.setAttribute('value', positions[4].z);



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
  xHuman.addEventListener('change', () => {
    changecounter();}
  )
  yHuman.addEventListener('change', () => {
    changecounter();}
  )
  zHuman.addEventListener('change', () => {
    changecounter();}
  )

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