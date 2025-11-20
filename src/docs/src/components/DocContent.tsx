import type { DocData } from '../data';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/motion';

interface DocContentProps {
  data: DocData;
}

export default function DocContent({ data }: DocContentProps) {
  return (
    <motion.main 
      className="flex-1 p-12 max-w-4xl"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.h1 
        className="text-5xl font-bold mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
        variants={fadeInUp}
      >
        {data.title}
      </motion.h1>
      {data.sections.map((section, index) => (
        <motion.section 
          key={index} 
          className="mb-12"
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">{section.heading}</h2>
          <div className="space-y-4">
            {section.content.split('\n').map((line, i) => (
              line.trim() && <p key={i} className="text-gray-600 whitespace-pre-wrap leading-relaxed">{line}</p>
            ))}
          </div>
        </motion.section>
      ))}
    </motion.main>
  );
}
