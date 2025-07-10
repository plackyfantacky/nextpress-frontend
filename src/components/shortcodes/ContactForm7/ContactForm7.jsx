import React from 'react';

export default function ContactForm7() {
    return (
        <form className="contact-form grid grid-cols-2 gap-4 w-full">
            <div className="form-group flex flex-col gap-2 col-span-2">
                <label htmlFor="name" className="pl-2 font-light text-base">Name</label>
                <input type="text" id="name" placeholder="Your name" className="bg-torchlight px-4 py-2 rounded-3xl" />
            </div>
            <div className="form-group flex flex-col gap-2 row-start-2">
                <label htmlFor="email" className="pl-2 font-light text-base">Email address</label>
                <input type="email" id="email" placeholder="Your email address" className="bg-torchlight px-4 py-2 rounded-3xl" />
            </div>
            <div className="form-group flex flex-col gap-2 row-start-2">
                <label htmlFor="phone" className="pl-2 font-light text-base">Phone Number</label>
                <input type="text" id="phone" placeholder="Your phone number" className="bg-torchlight px-4 py-2 rounded-3xl" />
            </div>
            <div className="form-group flex flex-col gap-2 col-span-2">
                <label htmlFor="message" className="pl-2 font-light text-base">Message</label>
                <textarea id="message" rows="3" placeholder="Your message" className="bg-torchlight px-3 py-3 rounded-xl"></textarea>
            </div>
            <div className="form-group flex justify-center items-center gap-2 col-span-2">
                <button type="submit" className="button-block">Send me a message</button>
            </div>
        </form>
    );
}