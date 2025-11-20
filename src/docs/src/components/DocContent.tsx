import type { DocData } from '../data';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/motion';

interface DocContentProps {
  data: DocData;
}

export default function DocContent({ data }: DocContentProps) {
  return (
    <motion.main 
      className="doc-content"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.h1 variants={fadeInUp}>{data.title}</motion.h1>
      {data.sections.map((section, index) => (
        <motion.section 
          key={index} 
          className="doc-section"
          variants={fadeInUp}
        >
          <h2>{section.heading}</h2>
          <div className="content">
            {section.content.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </motion.section>
      ))}
    </motion.main>
  );
}
