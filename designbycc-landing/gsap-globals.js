/* GSAP 3.12.5 from npm (GSAP standard licence). The page scripts are plain
   scripts that read window.gsap and window.CustomEase, so this module, the
   first import in site.js, puts them there. */
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

window.gsap = gsap;
window.CustomEase = CustomEase;
