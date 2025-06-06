/*
 * An "object" representing a 4x4 matrix to simplify and encapsulate matrix operations.
 *
 * This class allows us to work with matrices as distinct entities, enabling operations 
 * like multiplication, scaling, and transformations to be expressed concisely and 
 * consistently. 
 * 
 * The class assumes row-major order, meaning the elements are stored row by row in a 
 * one-dimensional array. For example:
 * 
 * Row 1: e[0], e[1], e[2], e[3]
 * Row 2: e[4], e[5], e[6], e[7]
 * Row 3: e[8], e[9], e[10], e[11]
 * Row 4: e[12], e[13], e[14], e[15]
 */

class Matrix4 {
  constructor() {
    this.elements = new Float32Array(16);
    this.makeIdentity();
  }

  // -------------------------------------------------------------------------
  clone() {
    const newMatrix = new Matrix4();
    for (let i = 0; i < 16; ++i) {
      newMatrix.elements[i] = this.elements[i];
    }
    return newMatrix;
  }

  // -------------------------------------------------------------------------
  copy(m) {
    for (let i = 0; i < 16; ++i) {
      this.elements[i] = m.elements[i];
    }

    return this;
  }

  // -------------------------------------------------------------------------
  getElement(row, col) {
    return this.elements[row * 4 + col];
  }

  // -------------------------------------------------------------------------
  set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
    const e = this.elements;

    e[0] = n11; e[1] = n12; e[2] = n13; e[3] = n14;
    e[4] = n21; e[5] = n22; e[6] = n23; e[7] = n24;
    e[8] = n31; e[9] = n32; e[10] = n33; e[11] = n34;
    e[12] = n41; e[13] = n42; e[14] = n43; e[15] = n44;

    return this;
  }

  // -------------------------------------------------------------------------
  multiplyScalar(s) {
    for (let i = 0; i < 16; ++i) {
      this.elements[i] = this.elements[i] * s;
    }
  }

  // -------------------------------------------------------------------------
  multiplyVector(v) {
    if (!(v instanceof Vector4)) {
      console.error("Trying to multiply a 4x4 matrix with an invalid vector value");
    }

    // shorthand
    const te = this.elements;
    const result = new Vector4(
      te[0] * v.x + te[1] * v.y + te[2] * v.z + te[3] * v.w,
      te[4] * v.x + te[5] * v.y + te[6] * v.z + te[7] * v.w,
      te[8] * v.x + te[9] * v.y + te[10] * v.z + te[11] * v.w,
      te[12] * v.x + te[13] * v.y + te[14] * v.z + te[15] * v.w
    );
    return result;
  }

  // -------------------------------------------------------------------------
  multiply(rightSideMatrix) {
    // safety check
    if (!(rightSideMatrix instanceof Matrix4)) {
      console.error("Trying to multiply a 4x4 matrix with an invalid matrix value");
    }

    // shorthand
    const te = this.elements;
    const oe = rightSideMatrix.elements;

    const m11 = te[0] * oe[0] + te[1] * oe[4] + te[2] * oe[8] + te[3] * oe[12];
    const m12 = te[0] * oe[1] + te[1] * oe[5] + te[2] * oe[9] + te[3] * oe[13];
    const m13 = te[0] * oe[2] + te[1] * oe[6] + te[2] * oe[10] + te[3] * oe[14];
    const m14 = te[0] * oe[3] + te[1] * oe[7] + te[2] * oe[11] + te[3] * oe[15];

    const m21 = te[4] * oe[0] + te[5] * oe[4] + te[6] * oe[8] + te[7] * oe[12];
    const m22 = te[4] * oe[1] + te[5] * oe[5] + te[6] * oe[9] + te[7] * oe[13];
    const m23 = te[4] * oe[2] + te[5] * oe[6] + te[6] * oe[10] + te[7] * oe[14];
    const m24 = te[4] * oe[3] + te[5] * oe[7] + te[6] * oe[11] + te[7] * oe[15];

    const m31 = te[8] * oe[0] + te[9] * oe[4] + te[10] * oe[8] + te[11] * oe[12];
    const m32 = te[8] * oe[1] + te[9] * oe[5] + te[10] * oe[9] + te[11] * oe[13];
    const m33 = te[8] * oe[2] + te[9] * oe[6] + te[10] * oe[10] + te[11] * oe[14];
    const m34 = te[8] * oe[3] + te[9] * oe[7] + te[10] * oe[11] + te[11] * oe[15];

    const m41 = te[12] * oe[0] + te[13] * oe[4] + te[14] * oe[8] + te[15] * oe[12];
    const m42 = te[12] * oe[1] + te[13] * oe[5] + te[14] * oe[9] + te[15] * oe[13];
    const m43 = te[12] * oe[2] + te[13] * oe[6] + te[14] * oe[10] + te[15] * oe[14];
    const m44 = te[12] * oe[3] + te[13] * oe[7] + te[14] * oe[11] + te[15] * oe[15];

    this.set(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44);

    return this;
  }

  // -------------------------------------------------------------------------
  premultiply(leftSideMatrix) {
    // safety check
    if (!(leftSideMatrix instanceof Matrix4)) {
      console.error("Trying to multiply a 4x4 matrix with an invalid matrix value");
    }

    // shorthand
    const oe = leftSideMatrix.elements;
    const te = this.elements;

    const m11 = oe[0] * te[0] + oe[1] * te[4] + oe[2] * te[8] + oe[3] * te[12];
    const m12 = oe[0] * te[1] + oe[1] * te[5] + oe[2] * te[9] + oe[3] * te[13];
    const m13 = oe[0] * te[2] + oe[1] * te[6] + oe[2] * te[10] + oe[3] * te[14];
    const m14 = oe[0] * te[3] + oe[1] * te[7] + oe[2] * te[11] + oe[3] * te[15];

    const m21 = oe[4] * te[0] + oe[5] * te[4] + oe[6] * te[8] + oe[7] * te[12];
    const m22 = oe[4] * te[1] + oe[5] * te[5] + oe[6] * te[9] + oe[7] * te[13];
    const m23 = oe[4] * te[2] + oe[5] * te[6] + oe[6] * te[10] + oe[7] * te[14];
    const m24 = oe[4] * te[3] + oe[5] * te[7] + oe[6] * te[11] + oe[7] * te[15];

    const m31 = oe[8] * te[0] + oe[9] * te[4] + oe[10] * te[8] + oe[11] * te[12];
    const m32 = oe[8] * te[1] + oe[9] * te[5] + oe[10] * te[9] + oe[11] * te[13];
    const m33 = oe[8] * te[2] + oe[9] * te[6] + oe[10] * te[10] + oe[11] * te[14];
    const m34 = oe[8] * te[3] + oe[9] * te[7] + oe[10] * te[11] + oe[11] * te[15];

    const m41 = oe[12] * te[0] + oe[13] * te[4] + oe[14] * te[8] + oe[15] * te[12];
    const m42 = oe[12] * te[1] + oe[13] * te[5] + oe[14] * te[9] + oe[15] * te[13];
    const m43 = oe[12] * te[2] + oe[13] * te[6] + oe[14] * te[10] + oe[15] * te[14];
    const m44 = oe[12] * te[3] + oe[13] * te[7] + oe[14] * te[11] + oe[15] * te[15];

    this.set(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44);

    return this;
  }

  // -------------------------------------------------------------------------
  makeIdentity() {
    this.set(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
    return this;
  }

  // -------------------------------------------------------------------------
  makeScale(x, y, z) {
    // laid out for clarity, not performance
    this.makeIdentity();
    this.elements[0] = x;
    this.elements[5] = y;
    this.elements[10] = z;
    return this;
  }

  // -------------------------------------------------------------------------
  makeRotationX(degrees) {
    const radians = degrees * Math.PI / 180;

    const e = this.elements;
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    e[0] = 1; e[1] = 0; e[2] = 0; e[3] = 0;
    e[4] = 0; e[5] = c; e[6] = -s; e[7] = 0;
    e[8] = 0; e[9] = s; e[10] = c; e[11] = 0;
    e[12] = 0; e[13] = 0; e[14] = 0; e[15] = 1;

    return this;
  }

  // -------------------------------------------------------------------------
  makeRotationY(degrees) {
    const radians = degrees * Math.PI / 180;

    const e = this.elements;
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    e[0] = c; e[1] = 0; e[2] = s; e[3] = 0;
    e[4] = 0; e[5] = 1; e[6] = 0; e[7] = 0;
    e[8] = -s; e[9] = 0; e[10] = c; e[11] = 0;
    e[12] = 0; e[13] = 0; e[14] = 0; e[15] = 1;

    return this;
  }

  // -------------------------------------------------------------------------
  makeRotationZ(degrees) {
    const radians = degrees * Math.PI / 180;

    const e = this.elements;
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    e[0] = c; e[1] = -s; e[2] = 0; e[3] = 0;
    e[4] = s; e[5] = c; e[6] = 0; e[7] = 0;
    e[8] = 0; e[9] = 0; e[10] = 1; e[11] = 0;
    e[12] = 0; e[13] = 0; e[14] = 0; e[15] = 1;

    return this;
  }

  // -------------------------------------------------------------------------
  makePerspective(fovy, aspect, near, far) {
    const fovyRads = (Math.PI / 180) * fovy;
    const t = near * Math.tan(fovyRads / 2);
    const r = t * aspect;

    // laid out for clarity, not performance
    this.makeIdentity();

    const e = this.elements;
    e[0] = near / r;
    e[5] = near / t;
    e[10] = -(far + near) / (far - near);
    e[11] = (-2 * near * far) / (far - near);
    e[14] = -1;
    e[15] = 0; // easy to forget this one (that lazy identity call...)

    return this;
  }

  // -------------------------------------------------------------------------
  makeOrthographic(left, right, top, bottom, near, far) {
    // laid out for clarity, not performance
    this.makeIdentity();

    const e = this.elements;
    e[0] = 2 / (right - left);
    e[3] = -(right + left) / (right - left);
    e[5] = 2 / (top - bottom);
    e[7] = -(top + bottom) / (top - bottom);
    e[10] = -2 / (far - near);
    e[11] = -(far + near) / (far - near);

    return this;
  }

  // -------------------------------------------------------------------------
  makeTranslation(arg1, arg2, arg3) {
    // laid out for clarity, not performance
    this.makeIdentity();

    if (arg1 instanceof Vector4) {
      this.elements[3] = arg1.x;
      this.elements[7] = arg1.y;
      this.elements[11] = arg1.z;
      this.elements[15] = arg1.w;
    }
    else if (arg1 instanceof Vector3) {
      this.elements[3] = arg1.x;
      this.elements[7] = arg1.y;
      this.elements[11] = arg1.z;
    } else {
      this.elements[3] = arg1;
      this.elements[7] = arg2;
      this.elements[11] = arg3;
    }
    return this;
  }

  // -------------------------------------------------------------------------
  determinant() {
    const e = this.elements;

    // laid out for clarity, not performance
    const m11 = e[0]; const m12 = e[1]; const m13 = e[2]; const m14 = e[3];
    const m21 = e[4]; const m22 = e[5]; const m23 = e[6]; const m24 = e[7];
    const m31 = e[8]; const m32 = e[9]; const m33 = e[10]; const m34 = e[11];
    const m41 = e[12]; const m42 = e[13]; const m43 = e[14]; const m44 = e[15];

    const det11 = m11 * (m22 * (m33 * m44 - m34 * m43) +
      m23 * (m34 * m42 - m32 * m44) +
      m24 * (m32 * m43 - m33 * m42));

    const det12 = -m12 * (m21 * (m33 * m44 - m34 * m43) +
      m23 * (m34 * m41 - m31 * m44) +
      m24 * (m31 * m43 - m33 * m41));

    const det13 = m13 * (m21 * (m32 * m44 - m34 * m42) +
      m22 * (m34 * m41 - m31 * m44) +
      m24 * (m31 * m42 - m32 * m41));

    const det14 = -m14 * (m21 * (m32 * m43 - m33 * m42) +
      m22 * (m33 * m41 - m31 * m43) +
      m23 * (m31 * m42 - m32 * m41));

    return det11 + det12 + det13 + det14;
  }

  // -------------------------------------------------------------------------
  transpose() {
    const te = this.elements;
    let tmp;

    tmp = te[1]; te[1] = te[4]; te[4] = tmp;
    tmp = te[2]; te[2] = te[8]; te[8] = tmp;
    tmp = te[6]; te[6] = te[9]; te[9] = tmp;

    tmp = te[3]; te[3] = te[12]; te[12] = tmp;
    tmp = te[7]; te[7] = te[13]; te[13] = tmp;
    tmp = te[11]; te[11] = te[14]; te[14] = tmp;

    return this;
  }

  // -------------------------------------------------------------------------
  inverse() {
    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    const te = this.elements,
      me = this.clone().elements,

      n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
      n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
      n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
      n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

      t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
      t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
      t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
      t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0) {
      const msg = "can't invert matrix, determinant is 0";
      console.warn(msg);
      return this.identity();
    }

    const detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

    te[4] = t12 * detInv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

    te[8] = t13 * detInv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

    te[12] = t14 * detInv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

    return this;
  }

  // -------------------------------------------------------------------------
  log() {
    const te = this.elements;
    console.log('[ ' +
      '\n ' + te[0] + ', ' + te[1] + ', ' + te[2] + ', ' + te[3] +
      '\n ' + te[4] + ', ' + te[5] + ', ' + te[6] + ', ' + te[7] +
      '\n ' + te[8] + ', ' + te[9] + ', ' + te[10] + ', ' + te[11] +
      '\n ' + te[12] + ', ' + te[13] + ', ' + te[14] + ', ' + te[15] +
      '\n]'
    );

    return this;
  }
}
