
        uniform float time;

        uniform float fogDensity;
        uniform vec3 fogColor;

        uniform sampler2D texture1;
        uniform sampler2D texture2;

        varying vec2 vUv;

        #define M_PI 3.14159265358979323846

float rand(vec2 co){return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);}
float rand (vec2 co, float l) {return rand(vec2(rand(co), l));}
float rand (vec2 co, float l, float t) {return rand(vec2(rand(co, l), t));}

float perlin(vec2 p, float dim, float time) {
	vec2 pos = floor(p * dim);
	vec2 posx = pos + vec2(1.0, 0.0);
	vec2 posy = pos + vec2(0.0, 1.0);
	vec2 posxy = pos + vec2(1.0);
	
	float c = rand(pos, dim, time);
	float cx = rand(posx, dim, time);
	float cy = rand(posy, dim, time);
	float cxy = rand(posxy, dim, time);
	
	vec2 d = fract(p * dim);
	d = -0.5 * cos(d * M_PI) + 0.5;
	
	float ccx = mix(c, cx, d.x);
	float cycxy = mix(cy, cxy, d.x);
	float center = mix(ccx, cycxy, d.y);
	
	return center * 2.0 - 1.0;
}

// p must be normalized!
float perlin(vec2 p, float dim) {
	
	/*vec2 pos = floor(p * dim);
	vec2 posx = pos + vec2(1.0, 0.0);
	vec2 posy = pos + vec2(0.0, 1.0);
	vec2 posxy = pos + vec2(1.0);
	
	// For exclusively black/white noise
	/*float c = step(rand(pos, dim), 0.5);
	float cx = step(rand(posx, dim), 0.5);
	float cy = step(rand(posy, dim), 0.5);
	float cxy = step(rand(posxy, dim), 0.5);*/
	
	/*float c = rand(pos, dim);
	float cx = rand(posx, dim);
	float cy = rand(posy, dim);
	float cxy = rand(posxy, dim);
	
	vec2 d = fract(p * dim);
	d = -0.5 * cos(d * M_PI) + 0.5;
	
	float ccx = mix(c, cx, d.x);
	float cycxy = mix(cy, cxy, d.x);
	float center = mix(ccx, cycxy, d.y);
	
	return center * 2.0 - 1.0;*/
	return perlin(p, dim, 0.0);
}

        void main( void ) {

            vec2 position = - 1.0 + 2.0 * vUv;

            vec4 noise = texture2D( texture1, vUv );

            float noise2 = perlin(vUv, 1.0, time * 0.1);

            // vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;
            vec2 T1 = vUv + vec2(.15, -.8) * time * 0.01;

            // vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;
            vec2 T2 = vUv + vec2(-.15, .3) * time * 0.01;


            // T1.x += noise.x * 2.0;
            // T1.y += noise.y * 2.0;
            // T2.x *= noise.x * 0.5;
            // T2.y *= noise.y * 0.2;


            /*T1.x += noise * 2.0;
            T1.y += noise * 2.0;
            T2.x *= noise * 0.5;
            T2.y *= noise * 0.2;*/

            float p = texture2D( texture1, T1 * 2.0 ).a;

            vec4 color = texture2D( texture2, T2 * 2.0 );
            vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );

            // if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
            // if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }
            // if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }

            gl_FragColor = temp;

            float depth = gl_FragCoord.z / gl_FragCoord.w;
            const float LOG2 = 1.442695;
            float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
            fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

            //gl_FragColor.rgb *= noise2;

            gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );


            // gl_FragColor = color;
        }
