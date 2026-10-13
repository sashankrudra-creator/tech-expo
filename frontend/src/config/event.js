// ✏️ Edit the event and school details here. Everything on the website reads from this file.
export const EVENT = {
  name: 'Tech Expo',
  year: 2026,
  dateISO: '2026-10-25T13:00:00+05:30', // countdown to 25 Oct 2026 1:00 PM
  dateLabel: '25 October 2026',
  timeLabel: '1:00 PM onwards',
  venue: 'School Auditorium',
  contact: '+91 8722567555',
  email: 'Info@smarvix.in',
  typingWords: ['race on tracks', 'pick up blocks', 'dodge obstacles', 'water plants', 'talk back'],
}

export const SCHOOL = {
  name: 'G.V. & K.B.M. English School',
  fullName: 'G.V. & K.B.M. English School, Ramachandrapuram',
  motto: 'Still Higher Ever Upward',
  blurb:
    'Empowering curious minds with hands-on STEM education, robotics innovation, and active learning by building. Motto: Still Higher Ever Upward.',
  tags: ['Robotics lab', 'Coding & STEM', 'Still Higher Ever Upward'],
}

export const ZONES = [
  { cls: 'z1', icon: 'race', title: 'Line-follower race', text: 'Robots read a black track with IR sensors and race to the finish.' },
  { cls: 'z2', icon: 'arm', title: 'Robotic arms', text: 'Servo-powered arms that pick, sort and stack blocks.' },
  { cls: 'z3', icon: 'sense', title: 'Smart sensors', text: 'Obstacle-dodging cars, auto lights and plant-watering systems.' },
  { cls: 'z4', icon: 'build', title: 'Student builds', text: 'Projects designed, wired and coded by our own students.' },
]

export const SCHEDULE = [
  { time: '9:30 AM', title: 'Check in', text: 'Show your entry ID at the desk to mark attendance.' },
  { time: '10:00 AM', title: 'Zones open', text: 'Explore demos and talk to the student builders.' },
  { time: '1:30 PM', title: 'Robot race', text: 'The line-follower final on the main track.' },
  { time: 'After the event', title: 'Certificates', text: 'Emailed to every attendee who gave an email.' },
]
