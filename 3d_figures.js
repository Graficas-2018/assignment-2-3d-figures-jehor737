var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

// TO DO: Create the functions for each of the figures.

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}


function createPyramid(gl, translation, rotationAxis)
{
  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var verts = [
     //Face 1
     0.0, -1.0, -1.275,
     1.214, -1.0, -0.394,
      0.0,  1.0,  0.0,

     // Face 2
     1.214, -1.0, -0.394,
     0.75, -1.0, 1.032,
      0.0,  1.0, 0.0,

     // Face 3
     0.75, -1.0, 1.032,
     -0.75, -1.0, 1.032,
     0.0, 1.0, 0.0,

     // Pentagon
      0.0, -1.0, -1.275,
      1.214, -1.0, -0.394,
      0.75, -1.0, 1.032,

      0.0, -1.0, -1.275,
      0.75, -1.0, 1.032,
      -0.75, -1.0, 1.032,

      0.0, -1.0, -1.275,
      -0.75, -1.0, 1.032,
      -1.214, -1.0,-0.394,

     // Face 4
     -0.75, -1.0, 1.032,
     -1.214, -1.0,-0.394,
     0.0, 1.0, 0.0,

     // Face 5
     -1.214, -1.0,-0.394,
     0.0, -1.0, -1.275,
     0.0, 1.0, 0.0
     ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Color data
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var faceColors = [
    [1.0, 0.0, 0.0], // Face 1
    [0.0, 1.0, 0.0], // Face 2
    [0.0, 0.0, 1.0], // Face 3
    [0.0, 1.0, 1.0], // Pentagon
    [0.0, 1.0, 1.0], // Pentagon
    [0.0, 1.0, 1.0], // Pentagon
    [1.0, 1.0, 0.0], // Face 4
    [1.0, 0.5, 1.0]  // Face 5
  ];

  // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the pyramid's face.
  var vertexColors = [];
  // for (var i in faceColors)
  // {
  //     var color = faceColors[i];
  //     for (var j=0; j < 4; j++)
  //         vertexColors = vertexColors.concat(color);
  // }
  for (const color of faceColors)
  {
      for (var j=0; j < 3; j++)
          vertexColors = vertexColors.concat(color);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  // Index data (defines the triangles to be drawn).
  var pyramidIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
  var pyramidIndices = [
      0, 1, 2,
      3, 4, 5,
      6, 7, 8,
      9, 10, 11,
      12, 13, 14,
      15 ,16, 17,
      18, 19, 20,
      21, 22, 23
  ];

  // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
  // Uint16Array: Array of 16-bit unsigned integers.
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

  var pyramid = {
          buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
          vertSize:3, nVerts:verts.length, colorSize:3, nColors: faceColors.length, nIndices:pyramidIndices.length,
          primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

  mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

  pyramid.update = function()
  {
      var now = Date.now();
      var deltat = now - this.currentTime;
      this.currentTime = now;
      var fract = deltat / duration;
      var angle = Math.PI * 2 * fract;

      // Rotates a mat4 by the given angle
      // mat4 out the receiving matrix
      // mat4 a the matrix to rotate
      // Number rad the angle to rotate the matrix by
      // vec3 axis the axis to rotate around
      mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
  };

  return pyramid;
}


function createOctahedron(gl, translation, rotationAxis,canvasHeight)
{
  var upDownY = 0;
  var goUp = true;
  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var verts = [
     // Face 1
     0.7071, 0.0, 0.0,
     0.0, 0.0,  0.7071,
     0.0, 0.7071, 0.0,

     // Face 2
     0.7071, 0.0, 0.0,
     0.0, -0.7071, 0.0,
     0.0, 0.0,  0.7071,

     // Face 3
     0.0, 0.0,  0.7071,
     -0.7071, 0.0, 0.0,
     0.0, 0.7071, 0.0,

     // Face 4
     0.0, 0.0,  0.7071,
     0.0, -0.7071, 0.0,
     -0.7071, 0.0, 0.0,

     // Face 5
     -0.7071, 0.0, 0.0,
     0.0, 0.0,  -0.7071,
     0.0, 0.7071, 0.0,

     //Face 6
     -0.7071, 0.0, 0.0,
     0.0, -0.7071, 0.0,
     0.0, 0.0,  -0.7071,

     //Face 7
     0.0, 0.0,  -0.7071,
     0.7071, 0.0, 0.0,
     0.0, 0.7071, 0.0,

     //Face 8
     0.0, 0.0,  -0.7071,
     0.0, -0.7071, 0.0,
     0.7071, 0.0, 0.0
     ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Color data
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var faceColors = [
      [1.0, 0.0, 0.0], // Face 1
      [0.0, 1.0, 0.0], // Face 2
      [0.0, 0.0, 1.0], // Face 3
      [1.0, 1.0, 0.0], // Face 4
      [1.0, 0.0, 1.0], // Face 5
      [0.0, 0.5, 0.5], // Face 6
      [1.0, 1.0, 1.0], // Face 7
      [0.7, 0.0, 0.0]  // Face 8
  ];

  // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the octahedron's face.
  var vertexColors = [];
  // for (var i in faceColors)
  // {
  //     var color = faceColors[i];
  //     for (var j=0; j < 4; j++)
  //         vertexColors = vertexColors.concat(color);
  // }
  for (const color of faceColors)
  {
      for (var j=0; j < 3; j++)
          vertexColors = vertexColors.concat(color);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  // Index data (defines the triangles to be drawn).
  var octahedronIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);
  var octahedronIndices = [
      0, 1, 2,
      3, 4, 5,
      6, 7, 8,
      9, 10, 11,
      12, 13, 14,
      15,16, 17,
      18, 19, 20,
      21, 22, 23
  ];

  // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
  // Uint16Array: Array of 16-bit unsigned integers.
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);

  var octahedron = {
          buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
          vertSize:3, nVerts:verts.length, colorSize:3, nColors: faceColors.length, nIndices:octahedronIndices.length,
          primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

  mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);
  octahedron.update = function()
  {
      var now = Date.now();
      var deltat = now - this.currentTime;
      this.currentTime = now;
      var fract = deltat / duration;
      var angle = Math.PI * 2 * fract;

      // Rotates a mat4 by the given angle
      // mat4 out the receiving matrix
      // mat4 a the matrix to rotate
      // Number rad the angle to rotate the matrix by
      // vec3 axis the axis to rotate around
      mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
      if(goUp){//Verify boolean to know if it goes up
        upDownY += 1;
        mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0,0.01,0]);
        if(upDownY >= canvasHeight/2){//Verify distance it has travelled
          goUp = false;//Change to go down
        }
      }
      else{
        upDownY -= 1;
        mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0,-0.01,0]);
        if(upDownY < -canvasHeight/2){//Verify distance it has travelled
          goUp = true;//Change to go up
        }
      }
    };

  return octahedron;
}


function createScutoid(gl, translation, rotationAxis)
{
  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var verts = [
    // Base Pentagon
    0.0, -1.0, -1.275,//0
    1.214, -1.0, -0.394,//1
    0.75, -1.0, 1.032,//2

    0.0, -1.0, -1.275,//0
    0.75, -1.0, 1.032,//2
    -0.75, -1.0, 1.032,//3

    0.0, -1.0, -1.275,//0
    -0.75, -1.0, 1.032,//3
    -1.214, -1.0,-0.394,//4

      //Face 1
      -0.75, -1.0, 1.032,//14
      -1.214, -1.0,-0.394,//15
       -0.75, 1.0, 1.11,//16

       -1.214, -1.0,-0.394,//15
       -1.275, 1.0, 0.0,//17
       -0.75, 1.0, 1.11,//16

     //Face 2
     0.75, -1.0, 1.032,//18
     -0.75, -1.0, 1.032,//19
     0.75, 1.0, 1.11,//20

     -0.75, -1.0, 1.032,//19
     -0.75, 1.0, 1.11,//21
     0.75, 1.0, 1.11,//20

    // Face 3
    1.214, -1.0, -0.394,//22
    0.75, -1.0, 1.032,//23
    1.275, 1.0, 0.0,//24

    0.75, -1.0, 1.032,//23
    0.75, 1.0, 1.11,//25
    1.275, 1.0, 0.0,//24

    //Base Hexagon
    0.75, 1.0, -1.11,//5
    1.275, 1.0, 0.0,//6
    0.75, 1.0, 1.11,//7

    0.75, 1.0, -1.11,//5
    0.75, 1.0, 1.11,//7
    -0.75, 1.0, -1.11,//10

    -0.75, 1.0, -1.11,//10
    0.75, 1.0, 1.11,//7
    -0.75, 1.0, 1.11,//8

    -0.75, 1.0, -1.11,//10
    -1.275, 1.0, 0.0,//9
    -0.75, 1.0, 1.11,//8

    //Face 4
    1.275, 1.0, 0.0,//26
    0.75, 1.0, -1.11,//27
    0.0, -1.0, -1.275,//28

    0.0, -1.0, -1.275,//28
    1.214, -1.0, -0.394,//29
    1.275, 1.0, 0.0,//26

    0.75, 1.0, -1.11,//27
    0.0, -0.074, -1.275,//30
    0.0, -1.0, -1.275,//28

    //Triangle
    0.75, 1.0, -1.11,//11
    -0.75, 1.0, -1.11,//12
    0.0, -0.074, -1.275,//13

    //Face 5
    -1.275, 1.0, 0.0,//9
    -1.214, -1.0,-0.394,//4
    0.0, -1.0, -1.275,//0

    -1.275, 1.0, 0.0,//9
    0.0, -1.0, -1.275,//0
    -0.75, 1.0, -1.11,//10

    -0.75, 1.0, -1.11,//10
    0.0, -1.0, -1.275,//0
    0.0, -0.074, -1.275//13
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Color data
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var faceColors = [
      [1.0, 0.0, 0.0], //Pentagon
      [1.0, 0.0, 0.0], //Pentagon
      [1.0, 0.0, 0.0], //Pentagon
      [0.0, 1.0, 0.0], //Face
      [0.0, 1.0, 0.0], //Face
      [0.0, 0.0, 1.0], //Face
      [0.0, 0.0, 1.0], //Face
      [0.5, 1.0, 0.9], //Face
      [0.5, 1.0, 0.9], //Face
      [0.5, 1.0, 0.0], //Hexagon
      [0.5, 1.0, 0.0], //Hexagon
      [0.5, 1.0, 0.0], //Hexagon
      [0.5, 1.0, 0.0], //Hexagon
      [1.0, 1.0, 0.0], //Face
      [1.0, 1.0, 0.0], //Face
      [1.0, 1.0, 0.0], //Face
      [1.0, 0.3, 1.0], //Triangle
      [0.8, 1.0, 1.0], //Face
      [0.8, 1.0, 1.0], //Face
      [0.8, 1.0, 1.0] ///Face
  ];

  // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the scutoid's face.
  var vertexColors = [];
  // for (var i in faceColors)
  // {
  //     var color = faceColors[i];
  //     for (var j=0; j < 4; j++)
  //         vertexColors = vertexColors.concat(color);
  // }
  for (const color of faceColors)
  {
      for (var j=0; j < 3; j++)
          vertexColors = vertexColors.concat(color);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  // Index data (defines the triangles to be drawn).
  var scutoidIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scutoidIndexBuffer);
  var scutoidIndices = [
      0, 1, 2, //Pentagon
      3, 4, 5, //Pentagon
      6, 7, 8, //Pentagon
      9, 10, 11,//Face regular 1
      12, 13, 14,//Face regular 1
      15, 16, 17,//Face regular 2
      18, 19, 20,//Face regular 2
      21, 22, 23,//Face regular 3
      24, 25, 26,//Face regular 3
      27,28,29,//Hexagon
      30,31,32,//Hexagon
      33,34,35,//Hexagon
      36,37,38,//Hexagon
      39,40,41,//Face irregular 1
      42,43,44,//Face irregular 1
      45,46,47,//Face irregular 1
      48,49,50,//Triangle
      51,52,53,//Face irregular 2
      54,55,56,//Face irregular 2
      57,58,59//Face irregular 2
  ];

  // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
  // Uint16Array: Array of 16-bit unsigned integers.
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(scutoidIndices), gl.STATIC_DRAW);

  var scutoid = {
          buffer:vertexBuffer, colorBuffer:colorBuffer, indices:scutoidIndexBuffer,
          vertSize:3, nVerts:verts.length, colorSize:3, nColors: faceColors.length, nIndices:scutoidIndices.length,
          primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

  mat4.translate(scutoid.modelViewMatrix, scutoid.modelViewMatrix, translation);

  scutoid.update = function()
  {
      var now = Date.now();
      var deltat = now - this.currentTime;
      this.currentTime = now;
      var fract = deltat / duration;
      var angle = Math.PI * 2 * fract;

      // Rotates a mat4 by the given angle
      // mat4 out the receiving matrix
      // mat4 a the matrix to rotate
      // Number rad the angle to rotate the matrix by
      // vec3 axis the axis to rotate around
      mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
  };

  return scutoid;
}



function draw(gl, objs)
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs)
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
