import React from "react";
import { motion } from 'framer-motion';
import "./Contact.css";

const Contact: React.FC = () => {
  // return (
  //   <div className="contact-wrapper">
  //     <div className="contact-card">
  //       <h1 className="contact-title">Contact Us</h1>
  //       <p className="contact-subtext">
  //         Have a question, feedback, or issue? Send us a message and we’ll get back to you.
  //       </p>

  //       <form
  //         className="contact-form"
  //         onSubmit={(e) => {
  //           e.preventDefault();
  //           alert("Your message has been sent!");
  //         }}
  //       >
  //         <div>
  //           <label>Name</label>
  //           <input type="text" placeholder="Your name" required />
  //         </div>

  //         <div>
  //           <label>Email</label>
  //           <input type="email" placeholder="you@example.com" required />
  //         </div>

  //         <div>
  //           <label>Topic</label>
  //           <select required>
  //             <option value="">Choose one...</option>
  //             <option value="support">Support</option>
  //             <option value="bug">Bug Report</option>
  //             <option value="feedback">Feedback</option>
  //             <option value="other">Other</option>
  //           </select>
  //         </div>

  //         <div>
  //           <label>Message</label>
  //           <textarea rows={5} placeholder="Write your message here..." required />
  //         </div>

  //         <button type="submit" className="contact-submit">
  //           Send Message
  //         </button>
  //       </form>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4" style={{ paddingBottom: '4rem'}}>
      <div className="w-full max-w-md space-y-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 0}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center text-black"
        >
          <motion.h1
            className="deepiri-heroTitle gradient-text-accent text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-emerald-400 bg-clip-text text-transparent"
            initial={{ opacity: 1 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300"
            initial={{ opacity: 1, y: -20 }}
          >
            Have a question, feedback, or issue? Send us a message and we’ll get back to you.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-modern p-8"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            alert("Your message has been sent!");
          }}
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <input 
                type="text"
                name="name"
                className="input-modern"
                required
              />
            </div>
            <div className="pt-3">
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input 
                type="email"
                name="name"
                className="input-modern"
                required
              />
            </div>
            <div className="pt-3">
              <label className="block text-sm font-medium mb-2">
                Topic
              </label>
              <select className="input-modern" required>
                <option disabled selected>Select...</option>
                <option value="support">Question</option>
                <option value="feedback">Feedback</option>
                <option value="bug">Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="pt-3">
              <label className="block text-sm font-medium mb-2">
                Message for Support
              </label>
              <textarea rows={5} className="input-modern" placeholder="Write your message here..." required />
            </div>
            <div className="pt-3">
              <button type="submit" className="btn-modern btn-primary w-full">
                Send Message
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
