import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, CustomEase);

CustomEase.create("auraEase", "0.65, 0.05, 0.36, 1");
CustomEase.create("auraExpo", "0.16, 1, 0.3, 1");

export { gsap, useGSAP, CustomEase };
