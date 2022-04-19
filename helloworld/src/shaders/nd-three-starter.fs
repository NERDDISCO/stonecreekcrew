uniform float time;

varying vec2 vUv;

void main(void) {
  gl_FragColor = vec4(sin(time), cos(time * -1.0), vUv.x, 1.0);
}
