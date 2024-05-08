import React from 'react';
import { motion } from "framer-motion";
import Link from "next/link";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="p-6"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm">© 2024 Crisis Chat Bot. All rights reserved.</span>
        <div className="flex space-x-4">
          <Link className="text-sm text-white/70 hover:text-white transition-colors duration-200" href="#">
            Terms of use
          </Link>
          <Link className="text-sm text-white/70 hover:text-white transition-colors duration-200" href="#">
            Privacy policy
          </Link>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;