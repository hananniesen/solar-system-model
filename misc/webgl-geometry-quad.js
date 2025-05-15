/**
 * This class encapsulates the data and operations needed for rasterizing
 * geometric objects in WebGL. It provides functionality to:
 * 
 * - Define object geometry (vertices, normals, texture coordinates, and indices)
 * - Upload data to the GPU using WebGL buffers
 * - Handle textures for textured rendering
 * - Render the object with support for vertex attributes and uniform data
 * 
 * Usage:
 * 1. Instantiate the class with a WebGL rendering context.
 * 2. Call `create()` to initialize the object's buffers and (optionally) textures.
 * 3. Use `render()` to draw the object with the desired shader program and matrices.
 */
class WebGLGeometryQuad {
    constructor(gl) {
        this.gl = gl;
        this.worldMatrix = new Matrix4();
        this.alpha = 1.0; 
    }

    // -----------------------------------------------------------------------------
    getPosition() {
        const e = this.worldMatrix.elements;
        return new Vector4(e[3], e[7], e[11], 1);
    }

    // -----------------------------------------------------------------------------
    create(rawImage) {
        const verts = [
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0,
            -1.0,  1.0,  0.0,
             1.0,  1.0,  0.0
        ];

        const normals = [
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0
        ];

        const uvs = [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ];

        const indices = [ 0, 1, 2, 2, 1, 3 ];
        this.indexCount = indices.length;

        // create the position and normal information for this object and send it to the GPU
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verts), this.gl.STATIC_DRAW);

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);

        this.texCoordsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uvs), this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        // If a raw image is provided, create a texture and configure it
        if (rawImage) {
            this.texture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                rawImage
            );
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
    }

    // -----------------------------------------------------------------------------
    render(camera, projectionMatrix, shaderProgram) {
        this.gl.useProgram(shaderProgram);

        const attributes = shaderProgram.attributes;
        const uniforms   = shaderProgram.uniforms;

        // Bind and set the vertex positions
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(
            attributes.vertexPositionAttribute,
            3,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

        // Bind and set the vertex normals if this attribute exists
        if (attributes.vertexNormalsAttribute !== undefined && attributes.vertexNormalsAttribute !== -1) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.vertexAttribPointer(
                attributes.vertexNormalsAttribute,
                3,
                this.gl.FLOAT,
                false,
                0,
                0
            );
            this.gl.enableVertexAttribArray(attributes.vertexNormalsAttribute);
        }

        // Bind and set the texture coordinates if this attribute exists
        if (attributes.vertexTexcoordsAttribute !== undefined && attributes.vertexTexcoordsAttribute !== -1) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordsBuffer);
            this.gl.vertexAttribPointer(
                attributes.vertexTexcoordsAttribute,
                2,
                this.gl.FLOAT,
                false,
                0,
                0
            );
            this.gl.enableVertexAttribArray(attributes.vertexTexcoordsAttribute);
        }

        // Bind the index buffer
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // If we have a texture, bind it to texture unit 0 and assign to the sampler
        if (this.texture && uniforms.textureUniform) {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.uniform1i(uniforms.textureUniform, 0); 
        }

        // Send our uniforms to the shader
        this.gl.uniformMatrix4fv( uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
        this.gl.uniformMatrix4fv( uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
        this.gl.uniformMatrix4fv( uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);
        this.gl.uniform1f(uniforms.alphaUniform, this.alpha);

        // Draw the geometry
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);

        // Unbind the texture if it was bound
        if (this.texture && uniforms.textureUniform) 
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        // Disable the vertex attribute arrays
        this.gl.disableVertexAttribArray(attributes.vertexPositionAttribute);

        if (attributes.vertexNormalsAttribute !== undefined && attributes.vertexNormalsAttribute !== -1) 
            this.gl.disableVertexAttribArray(attributes.vertexNormalsAttribute);

        if (attributes.vertexTexcoordsAttribute !== undefined && attributes.vertexTexcoordsAttribute !== -1) 
            this.gl.disableVertexAttribArray(attributes.vertexTexcoordsAttribute);
    }
}