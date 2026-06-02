import { motion } from "framer-motion";

export default function SceneSection({ scene, image, active }) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 1.035 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      <img src={image} alt={scene[0]} loading="lazy" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/30 to-black/10" />
    </motion.div>
  );
}
