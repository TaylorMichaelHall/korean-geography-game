import { motion } from 'framer-motion'

/** Dismissible overlay: backdrop + spring-in card + close button.
 *  Render inside an <AnimatePresence> so the exit animation runs. */
export function Modal({
  className = '', onClose, children,
}: {
  className?: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <motion.div className="detail-scrim" onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className={`card ${className}`} onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
        <button className="detail-x" onClick={onClose} aria-label="Close">×</button>
        {children}
      </motion.div>
    </motion.div>
  )
}
