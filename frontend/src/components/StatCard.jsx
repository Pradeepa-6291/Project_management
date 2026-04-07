import { motion } from "framer-motion";

export default function StatCard({ label, value, tone }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4">
      <div className={`mb-2 inline-block rounded-xl bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${tone}`}>
        {label}
      </div>
      <h3 className="text-2xl font-bold">{value}</h3>
    </motion.div>
  );
}
