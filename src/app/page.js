"use client";

import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function Home() {
  // --- STATE DECLARATIONS ---
  const [activeTab, setActiveTab] = useState("academy");

  // Step 1: Academy
  const [academyName, setAcademyName] = useState("LEAPS Academy");
  const [headingText, setHeadingText] = useState("Time Table");
  const [logo, setLogo] = useState(""); // Base64
  const [footerText, setFooterText] = useState("LA25092025 V 1.1");

  // Step 2: Classes
  const [classes, setClasses] = useState([
    { id: "class-1", name: "9th", startTime: "16:00", endTime: "20:30" },
    { id: "class-2", name: "10th", startTime: "16:00", endTime: "20:30" },
    { id: "class-3", name: "First Year", startTime: "16:00", endTime: "20:30" },
    { id: "class-4", name: "Second Year", startTime: "16:00", endTime: "20:30" }
  ]);

  // Step 3: Teachers
  const [teachers, setTeachers] = useState([
    {
      id: "teacher-1",
      name: "Sir Ali",
      subject: "Math",
      secondSubject: "Physics",
      availableFrom: "16:30",
      availableTill: "20:00",
      allowedClasses: ["9th", "10th", "First Year", "Second Year"]
    },
    {
      id: "teacher-2",
      name: "Sir Imran",
      subject: "Islamiyat",
      secondSubject: "T. Quran",
      availableFrom: "16:00",
      availableTill: "20:30",
      allowedClasses: ["9th", "10th"]
    }
  ]);

  // Step 4 & 5: Timetable Data
  const [timetable, setTimetable] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);

  // --- LOCALSTORAGE PERSISTENCE ---
  useEffect(() => {
    const savedAcademyName = localStorage.getItem("leaps_academy_name");
    const savedHeadingText = localStorage.getItem("leaps_heading_text");
    const savedLogo = localStorage.getItem("leaps_logo");
    const savedFooterText = localStorage.getItem("leaps_footer_text");
    const savedClasses = localStorage.getItem("leaps_classes");
    const savedTeachers = localStorage.getItem("leaps_teachers");
    const savedTimetable = localStorage.getItem("leaps_timetable");
    const savedTimeSlots = localStorage.getItem("leaps_time_slots");

    if (savedAcademyName) setAcademyName(savedAcademyName);
    if (savedHeadingText) setHeadingText(savedHeadingText);
    if (savedLogo) setLogo(savedLogo);
    if (savedFooterText) setFooterText(savedFooterText);
    if (savedClasses) setClasses(JSON.parse(savedClasses));
    if (savedTeachers) setTeachers(JSON.parse(savedTeachers));
    if (savedTimetable) setTimetable(JSON.parse(savedTimetable));
    if (savedTimeSlots) setTimeSlots(JSON.parse(savedTimeSlots));
  }, []);

  const saveData = (updatedData = {}) => {
    const dAcademyName = updatedData.academyName ?? academyName;
    const dHeading = updatedData.headingText ?? headingText;
    const dLogo = updatedData.logo ?? logo;
    const dFooter = updatedData.footerText ?? footerText;
    const dClasses = updatedData.classes ?? classes;
    const dTeachers = updatedData.teachers ?? teachers;
    const dTimetable = updatedData.timetable ?? timetable;
    const dTimeSlots = updatedData.timeSlots ?? timeSlots;

    localStorage.setItem("leaps_academy_name", dAcademyName);
    localStorage.setItem("leaps_heading_text", dHeading);
    localStorage.setItem("leaps_logo", dLogo);
    localStorage.setItem("leaps_footer_text", dFooter);
    localStorage.setItem("leaps_classes", JSON.stringify(dClasses));
    localStorage.setItem("leaps_teachers", JSON.stringify(dTeachers));
    localStorage.setItem("leaps_timetable", JSON.stringify(dTimetable));
    localStorage.setItem("leaps_time_slots", JSON.stringify(dTimeSlots));
  };

  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to reset all data to default settings?")) {
      localStorage.clear();
      setAcademyName("LEAPS Academy");
      setHeadingText("Time Table");
      setLogo("");
      setFooterText("LA25092025 V 1.1");
      
      const defaultClasses = [
        { id: "class-1", name: "9th", startTime: "16:00", endTime: "20:30" },
        { id: "class-2", name: "10th", startTime: "16:00", endTime: "20:30" },
        { id: "class-3", name: "First Year", startTime: "16:00", endTime: "20:30" },
        { id: "class-4", name: "Second Year", startTime: "16:00", endTime: "20:30" }
      ];
      setClasses(defaultClasses);

      const defaultTeachers = [
        {
          id: "teacher-1",
          name: "Sir Ali",
          subject: "Math",
          secondSubject: "Physics",
          availableFrom: "16:30",
          availableTill: "20:00",
          allowedClasses: ["9th", "10th", "First Year", "Second Year"]
        },
        {
          id: "teacher-2",
          name: "Sir Imran",
          subject: "Islamiyat",
          secondSubject: "T. Quran",
          availableFrom: "16:00",
          availableTill: "20:30",
          allowedClasses: ["9th", "10th"]
        }
      ];
      setTeachers(defaultTeachers);
      setTimetable({});
      setTimeSlots([]);
      setActiveTab("academy");
      alert("All data reset successfully.");
    }
  };

  // --- TIME UTILITIES ---
  const parseTimeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const formatMinutesTo12Hour = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    let displayH = hours % 12;
    if (displayH === 0) displayH = 12;
    const displayM = minutes.toString().padStart(2, "0");
    return `${displayH}:${displayM} ${period}`;
  };

  const generateSlotsForClass = (classItem) => {
    const startM = parseTimeToMinutes(classItem.startTime);
    const endM = parseTimeToMinutes(classItem.endTime);
    const slots = [];
    for (let m = startM; m < endM; m += 30) {
      const slotStart = formatMinutesTo12Hour(m);
      const slotEnd = formatMinutesTo12Hour(m + 30);
      slots.push(`${slotStart}–${slotEnd}`);
    }
    return slots;
  };

  // --- LOGO UPLOADER ---
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
        saveData({ logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- GENERATION ALGORITHM ---
  const generateTimetable = () => {
    const classSlotsMap = {};
    const allUniqueSlotsSet = new Set();

    classes.forEach((c) => {
      const slots = generateSlotsForClass(c);
      classSlotsMap[c.id] = slots;
      slots.forEach((s) => allUniqueSlotsSet.add(s));
    });

    const sortedSlots = Array.from(allUniqueSlotsSet).sort((a, b) => {
      const getTimeMinutes = (slotStr) => {
        const timePart = slotStr.split("–")[0];
        const [time, period] = timePart.split(" ");
        let [h, m] = time.split(":").map(Number);
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return h * 60 + m;
      };
      return getTimeMinutes(a) - getTimeMinutes(b);
    });

    const newTimetable = {};
    classes.forEach((c) => {
      newTimetable[c.id] = {};
    });

    const busyTeachersPerSlot = {};
    sortedSlots.forEach((slot) => {
      busyTeachersPerSlot[slot] = new Set();
    });

    const isTeacherAvailableForSlot = (teacher, slotStr) => {
      const [slotStartStr, slotEndStr] = slotStr.split("–");
      
      const getMin = (s) => {
        const [time, period] = s.split(" ");
        let [h, m] = time.split(":").map(Number);
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return h * 60 + m;
      };

      const slotStartMin = getMin(slotStartStr);
      const slotEndMin = getMin(slotEndStr);

      const teacherStartMin = parseTimeToMinutes(teacher.availableFrom);
      const teacherEndMin = parseTimeToMinutes(teacher.availableTill);

      return slotStartMin >= teacherStartMin && slotEndMin <= teacherEndMin;
    };

    classes.forEach((c) => {
      const activeSlots = classSlotsMap[c.id];
      activeSlots.forEach((slot) => {
        const candidateTeachers = teachers.filter((t) => {
          const teachesThisClass = t.allowedClasses.includes(c.name);
          const availableInTime = isTeacherAvailableForSlot(t, slot);
          const notBusy = !busyTeachersPerSlot[slot].has(t.id);
          return teachesThisClass && availableInTime && notBusy;
        });

        if (candidateTeachers.length > 0) {
          const chosenTeacher = candidateTeachers[Math.floor(Math.random() * candidateTeachers.length)];
          const selectSubject = chosenTeacher.secondSubject && Math.random() > 0.5 
            ? chosenTeacher.secondSubject 
            : chosenTeacher.subject;

          newTimetable[c.id][slot] = {
            subject: selectSubject,
            teacher: chosenTeacher.name,
            isTest: false
          };

          busyTeachersPerSlot[slot].add(chosenTeacher.id);
        } else {
          newTimetable[c.id][slot] = {
            subject: "-",
            teacher: "-",
            isTest: false
          };
        }
      });
    });

    setTimeSlots(sortedSlots);
    setTimetable(newTimetable);
    saveData({
      timeSlots: sortedSlots,
      timetable: newTimetable
    });
    setActiveTab("preview");
  };

  // --- MANUAL EDITING ---
  const handleCellEdit = (classId, slot, field, value) => {
    const updated = { ...timetable };
    if (!updated[classId]) updated[classId] = {};
    if (!updated[classId][slot]) {
      updated[classId][slot] = { subject: "-", teacher: "-", isTest: false };
    }
    updated[classId][slot][field] = value;
    setTimetable(updated);
    saveData({ timetable: updated });
  };

  const toggleTestCell = (classId, slot) => {
    const updated = { ...timetable };
    if (!updated[classId]) updated[classId] = {};
    if (!updated[classId][slot]) {
      updated[classId][slot] = { subject: "-", teacher: "-", isTest: false };
    }
    updated[classId][slot].isTest = !updated[classId][slot].isTest;
    
    if (updated[classId][slot].isTest) {
      updated[classId][slot].subject = "TEST";
      updated[classId][slot].teacher = "";
    } else {
      updated[classId][slot].subject = "Subject";
      updated[classId][slot].teacher = "Teacher";
    }

    setTimetable(updated);
    saveData({ timetable: updated });
  };

  const handleClearCell = (classId, slot) => {
    const updated = { ...timetable };
    if (!updated[classId]) updated[classId] = {};
    updated[classId][slot] = { subject: "-", teacher: "-", isTest: false };
    setTimetable(updated);
    saveData({ timetable: updated });
  };

  const handleClassNameChange = (classId, newName) => {
    const updatedClasses = classes.map((c) => (c.id === classId ? { ...c, name: newName } : c));
    setClasses(updatedClasses);
    saveData({ classes: updatedClasses });
  };

  const handleSlotNameChange = (index, newValue) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = newValue;
    setTimeSlots(updatedSlots);
    saveData({ timeSlots: updatedSlots });
  };

  const handleAddClassRow = () => {
    const newId = `class-${Date.now()}`;
    const newClass = { id: newId, name: `Class ${classes.length + 1}`, startTime: "16:00", endTime: "20:30" };
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);

    const updatedTimetable = { ...timetable };
    updatedTimetable[newId] = {};
    timeSlots.forEach((slot) => {
      updatedTimetable[newId][slot] = { subject: "-", teacher: "-", isTest: false };
    });

    setTimetable(updatedTimetable);
    saveData({ classes: updatedClasses, timetable: updatedTimetable });
  };

  const handleRemoveClassRow = (classId) => {
    if (window.confirm("Remove this class row?")) {
      const updatedClasses = classes.filter((c) => c.id !== classId);
      const updatedTimetable = { ...timetable };
      delete updatedTimetable[classId];
      setClasses(updatedClasses);
      setTimetable(updatedTimetable);
      saveData({ classes: updatedClasses, timetable: updatedTimetable });
    }
  };

  const handleAddTimeSlot = () => {
    const newSlot = "08:30 PM–09:00 PM";
    const updatedSlots = [...timeSlots, newSlot];
    setTimeSlots(updatedSlots);

    const updatedTimetable = { ...timetable };
    classes.forEach((c) => {
      if (!updatedTimetable[c.id]) updatedTimetable[c.id] = {};
      updatedTimetable[c.id][newSlot] = { subject: "-", teacher: "-", isTest: false };
    });

    setTimetable(updatedTimetable);
    saveData({ timeSlots: updatedSlots, timetable: updatedTimetable });
  };

  const handleRemoveTimeSlot = (slotIndex) => {
    if (window.confirm("Remove this time slot column?")) {
      const targetSlot = timeSlots[slotIndex];
      const updatedSlots = timeSlots.filter((_, idx) => idx !== slotIndex);
      setTimeSlots(updatedSlots);

      const updatedTimetable = { ...timetable };
      classes.forEach((c) => {
        if (updatedTimetable[c.id]) {
          delete updatedTimetable[c.id][targetSlot];
        }
      });

      setTimetable(updatedTimetable);
      saveData({ timeSlots: updatedSlots, timetable: updatedTimetable });
    }
  };

  // --- EXPORT LOGICS ---
  const downloadPDF = async () => {
    const element = document.getElementById("timetable-export");
    if (!element) return;

    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
    pdf.save("LEAPS_Academy_Timetable.pdf");
  };

  const downloadJPG = async () => {
    const element = document.getElementById("timetable-export");
    if (!element) return;

    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const link = document.createElement("a");
    link.download = "LEAPS_Academy_Timetable.jpg";
    link.href = canvas.toDataURL("image/jpeg", 1.0);
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* HEADER BAR */}
      <header className="bg-stone-900 text-white shadow-xl no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-stone-950 font-extrabold w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-md font-serif">
              L
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-100">
                {academyName}
              </h1>
              <p className="text-xs text-stone-400">Academy Time Table Maker</p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {[
              { id: "academy", label: "Academy Setup" },
              { id: "classes", label: "Classes" },
              { id: "teachers", label: "Teachers" },
              { id: "generate", label: "Generate" },
              { id: "preview", label: "Preview & Export" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-amber-50 text-stone-950 shadow-md transform -translate-y-0.5"
                    : "text-stone-300 hover:bg-stone-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleResetAll}
            className="px-4 py-2 border border-stone-700 hover:border-red-500 hover:bg-red-950/30 text-stone-400 hover:text-red-400 rounded-lg text-xs font-semibold transition-all duration-300"
          >
            Reset All Data
          </button>
        </div>
      </header>

      {/* WIZARD CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 no-print">
        {/* Step 1: Academy Setup */}
        {activeTab === "academy" && (
          <div className="glass-panel p-6 shadow-md max-w-2xl mx-auto border border-stone-200">
            <h2 className="text-2xl font-bold mb-6 text-stone-900 border-b border-stone-200 pb-3 font-serif">
              Step 1: Academy Setup
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Academy Name
                </label>
                <input
                  type="text"
                  value={academyName}
                  onChange={(e) => {
                    setAcademyName(e.target.value);
                    saveData({ academyName: e.target.value });
                  }}
                  className="w-full bg-white border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Enter Academy Name..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Heading Text
                </label>
                <input
                  type="text"
                  value={headingText}
                  onChange={(e) => {
                    setHeadingText(e.target.value);
                    saveData({ headingText: e.target.value });
                  }}
                  className="w-full bg-white border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Time Table"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Upload Logo
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    id="logo-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer bg-stone-850 hover:bg-stone-800 text-stone-200 font-bold px-4 py-2.5 border border-stone-300 hover:border-amber-500 rounded-lg text-sm transition-all shadow-sm"
                  >
                    Select Image
                  </label>
                  {logo ? (
                    <div className="relative w-16 h-16 rounded border border-stone-300 overflow-hidden bg-stone-100 flex items-center justify-center">
                      <img src={logo} alt="Academy Logo" className="object-contain max-w-full max-h-full" />
                      <button
                        onClick={() => {
                          setLogo("");
                          saveData({ logo: "" });
                        }}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5 text-2xs hover:bg-red-700"
                        title="Remove Logo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-500 italic">No logo uploaded. Standard crest will display.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Footer Code / Version Text
                </label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => {
                    setFooterText(e.target.value);
                    saveData({ footerText: e.target.value });
                  }}
                  className="w-full bg-white border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="LA25092025 V 1.1"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setActiveTab("classes")}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all uppercase tracking-wider"
                >
                  Continue to Classes Setup →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Classes Setup */}
        {activeTab === "classes" && (
          <div className="glass-panel p-6 shadow-md max-w-4xl mx-auto border border-stone-200">
            <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-3">
              <h2 className="text-2xl font-bold text-stone-900 font-serif">
                Step 2: Classes Setup
              </h2>
              <button
                onClick={() => {
                  const num = prompt("How many classes would you like to have?", classes.length);
                  if (num !== null) {
                    const parsedNum = parseInt(num);
                    if (!isNaN(parsedNum) && parsedNum > 0) {
                      const updated = [...classes];
                      if (parsedNum > classes.length) {
                        for (let i = classes.length; i < parsedNum; i++) {
                          updated.push({
                            id: `class-${Date.now()}-${i}`,
                            name: `${i + 9}th`,
                            startTime: "16:00",
                            endTime: "20:30"
                          });
                        }
                      } else {
                        updated.splice(parsedNum);
                      }
                      setClasses(updated);
                      saveData({ classes: updated });
                    }
                  }
                }}
                className="text-xs font-semibold px-3 py-1.5 border border-stone-400 hover:border-amber-500 text-stone-700 hover:text-stone-900 rounded transition-all"
              >
                Set Class Count
              </button>
            </div>

            <div className="space-y-4">
              {classes.map((c, index) => (
                <div
                  key={c.id}
                  className="flex flex-col md:flex-row items-center gap-4 bg-white/50 p-4 border border-stone-200 rounded-lg shadow-sm"
                >
                  <div className="w-full md:w-1/3">
                    <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                      Class {index + 1} Name
                    </label>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const updated = classes.map((item) =>
                          item.id === c.id ? { ...item, name: e.target.value } : item
                        );
                        setClasses(updated);
                        saveData({ classes: updated });
                      }}
                      className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-950 text-sm font-semibold"
                      placeholder="e.g. 9th"
                    />
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                      Starting Time
                    </label>
                    <input
                      type="time"
                      value={c.startTime}
                      onChange={(e) => {
                        const updated = classes.map((item) =>
                          item.id === c.id ? { ...item, startTime: e.target.value } : item
                        );
                        setClasses(updated);
                        saveData({ classes: updated });
                      }}
                      className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-950 text-sm"
                    />
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                      Ending Time
                    </label>
                    <input
                      type="time"
                      value={c.endTime}
                      onChange={(e) => {
                        const updated = classes.map((item) =>
                          item.id === c.id ? { ...item, endTime: e.target.value } : item
                        );
                        setClasses(updated);
                        saveData({ classes: updated });
                      }}
                      className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-950 text-sm"
                    />
                  </div>

                  <div className="flex items-end justify-end h-full pt-4 md:pt-0">
                    <button
                      onClick={() => {
                        const updated = classes.filter((item) => item.id !== c.id);
                        setClasses(updated);
                        saveData({ classes: updated });
                      }}
                      className="text-red-500 hover:text-red-650 p-2 hover:bg-red-50 rounded transition-all text-sm font-semibold"
                      title="Delete Class"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    const newId = `class-${Date.now()}`;
                    const updated = [...classes, { id: newId, name: `Class ${classes.length + 1}`, startTime: "16:00", endTime: "20:30" }];
                    setClasses(updated);
                    saveData({ classes: updated });
                  }}
                  className="px-4 py-2 border border-stone-400 hover:border-stone-900 text-stone-700 hover:text-stone-950 rounded-lg text-sm font-bold transition-all"
                >
                  + Add Another Class
                </button>

                <button
                  onClick={() => setActiveTab("teachers")}
                  className="flex-grow bg-stone-900 hover:bg-stone-850 text-white font-bold py-2 rounded-lg text-sm transition-all"
                >
                  Continue to Teachers Setup →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Teachers Setup */}
        {activeTab === "teachers" && (
          <div className="glass-panel p-6 shadow-md max-w-4xl mx-auto border border-stone-200">
            <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-3">
              <h2 className="text-2xl font-bold text-stone-900 font-serif">
                Step 3: Teachers Setup
              </h2>
              <button
                onClick={() => {
                  const num = prompt("How many teachers would you like to configure?", teachers.length);
                  if (num !== null) {
                    const parsedNum = parseInt(num);
                    if (!isNaN(parsedNum) && parsedNum > 0) {
                      const updated = [...teachers];
                      if (parsedNum > teachers.length) {
                        for (let i = teachers.length; i < parsedNum; i++) {
                          updated.push({
                            id: `teacher-${Date.now()}-${i}`,
                            name: `Teacher ${i + 1}`,
                            subject: "Subject",
                            secondSubject: "",
                            availableFrom: "16:00",
                            availableTill: "20:30",
                            allowedClasses: classes.map((c) => c.name)
                          });
                        }
                      } else {
                        updated.splice(parsedNum);
                      }
                      setTeachers(updated);
                      saveData({ teachers: updated });
                    }
                  }
                }}
                className="text-xs font-semibold px-3 py-1.5 border border-stone-400 hover:border-amber-500 text-stone-700 hover:text-stone-950 rounded transition-all"
              >
                Set Teacher Count
              </button>
            </div>

            <div className="space-y-6">
              {teachers.map((t, index) => (
                <div
                  key={t.id}
                  className="bg-white/60 p-5 border border-stone-200 rounded-xl shadow-sm space-y-4 relative"
                >
                  <button
                    onClick={() => {
                      const updated = teachers.filter((item) => item.id !== t.id);
                      setTeachers(updated);
                      saveData({ teachers: updated });
                    }}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-semibold transition-all"
                  >
                    Delete Teacher
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                        Teacher {index + 1} Name
                      </label>
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => {
                          const updated = teachers.map((item) =>
                            item.id === t.id ? { ...item, name: e.target.value } : item
                          );
                          setTeachers(updated);
                          saveData({ teachers: updated });
                        }}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm font-semibold"
                        placeholder="Sir Imran"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                        Main Subject
                      </label>
                      <input
                        type="text"
                        value={t.subject}
                        onChange={(e) => {
                          const updated = teachers.map((item) =>
                            item.id === t.id ? { ...item, subject: e.target.value } : item
                          );
                          setTeachers(updated);
                          saveData({ teachers: updated });
                        }}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm"
                        placeholder="Islamiyat"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                        Second Subject (Optional)
                      </label>
                      <input
                        type="text"
                        value={t.secondSubject}
                        onChange={(e) => {
                          const updated = teachers.map((item) =>
                            item.id === t.id ? { ...item, secondSubject: e.target.value } : item
                          );
                          setTeachers(updated);
                          saveData({ teachers: updated });
                        }}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm"
                        placeholder="T. Quran"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                        Availability Start
                      </label>
                      <input
                        type="time"
                        value={t.availableFrom}
                        onChange={(e) => {
                          const updated = teachers.map((item) =>
                            item.id === t.id ? { ...item, availableFrom: e.target.value } : item
                          );
                          setTeachers(updated);
                          saveData({ teachers: updated });
                        }}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                        Availability Till
                      </label>
                      <input
                        type="time"
                        value={t.availableTill}
                        onChange={(e) => {
                          const updated = teachers.map((item) =>
                            item.id === t.id ? { ...item, availableTill: e.target.value } : item
                          );
                          setTeachers(updated);
                          saveData({ teachers: updated });
                        }}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase text-stone-500 mb-2">
                      Classes Teacher Can Teach
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {classes.map((cls) => {
                        const isChecked = t.allowedClasses.includes(cls.name);
                        return (
                          <label
                            key={cls.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                              isChecked
                                ? "bg-amber-50 border-amber-500 text-amber-950 font-semibold"
                                : "bg-white border-stone-300 text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const newClasses = e.target.checked
                                  ? [...t.allowedClasses, cls.name]
                                  : t.allowedClasses.filter((name) => name !== cls.name);

                                const updated = teachers.map((item) =>
                                  item.id === t.id ? { ...item, allowedClasses: newClasses } : item
                                );
                                setTeachers(updated);
                                saveData({ teachers: updated });
                              }}
                              className="accent-amber-500 rounded cursor-pointer"
                            />
                            {cls.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    const newId = `teacher-${Date.now()}`;
                    const updated = [
                      ...teachers,
                      {
                        id: newId,
                        name: `Teacher ${teachers.length + 1}`,
                        subject: "Subject",
                        secondSubject: "",
                        availableFrom: "16:00",
                        availableTill: "20:30",
                        allowedClasses: classes.map((c) => c.name)
                      }
                    ];
                    setTeachers(updated);
                    saveData({ teachers: updated });
                  }}
                  className="px-4 py-2 border border-stone-400 hover:border-stone-900 text-stone-700 hover:text-stone-950 rounded-lg text-sm font-bold transition-all"
                >
                  + Add Another Teacher
                </button>

                <button
                  onClick={() => setActiveTab("generate")}
                  className="flex-grow bg-stone-900 hover:bg-stone-850 text-white font-bold py-2 rounded-lg text-sm transition-all"
                >
                  Continue to Timetable Generation →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Generate Timetable */}
        {activeTab === "generate" && (
          <div className="glass-panel p-8 shadow-md max-w-xl mx-auto border border-stone-200 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-stone-950 font-serif">
              Generate Academic Timetable
            </h2>

            <p className="text-stone-600 text-sm max-w-sm mx-auto leading-relaxed">
              Our automated engine will allocate teachers based on availability, preferred subjects, active slots per class, and strict anti-collision algorithms.
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left text-xs text-stone-600 space-y-2">
              <span className="font-bold text-stone-800 uppercase tracking-wider block mb-1">Strict Rules Engine:</span>
              <div className="flex gap-2">✓ <p>Each lecture is strictly 30 minutes long.</p></div>
              <div className="flex gap-2">✓ <p>No teacher is ever double-booked at the same time slot.</p></div>
              <div className="flex gap-2">✓ <p>Teachers are only scheduled during their available hours.</p></div>
              <div className="flex gap-2">✓ <p>Teachers only cover their permitted classes.</p></div>
            </div>

            <button
              onClick={generateTimetable}
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold py-3.5 rounded-lg text-sm shadow-md transition-all tracking-wider uppercase"
            >
              Generate Timetable Now
            </button>
          </div>
        )}

        {/* Step 5 & 6: Interactive Live A4 Preview & Edit Tab */}
        {activeTab === "preview" && (
          <div className="space-y-6">
            {timeSlots.length === 0 ? (
              <div className="glass-panel p-12 text-center max-w-lg mx-auto border border-stone-200 space-y-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold text-stone-900 font-serif">Please generate timetable first.</h3>
                <p className="text-stone-500 text-xs">
                  Configure classes and teachers, then click the Generate tab to create your master timetable.
                </p>
                <button
                  onClick={() => setActiveTab("generate")}
                  className="bg-stone-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-md hover:bg-stone-800 transition-all"
                >
                  Go to Generate Tab
                </button>
              </div>
            ) : (
              <>
                {/* Control panel and downloads */}
                <div className="glass-panel p-6 shadow-md border border-stone-200 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-950 font-serif">
                      A4 Landscape Live Editor & Exports
                    </h2>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Click on any text (headings, class names, timeslot headers, subjects, or teacher names) inside the A4 layout below to modify them instantly.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={downloadJPG}
                      className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-lg text-xs transition-all shadow-sm"
                    >
                      Download JPG
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="bg-stone-900 hover:bg-stone-850 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-all shadow-sm"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={handlePrint}
                      className="border border-stone-400 hover:border-stone-950 hover:bg-stone-50 text-stone-700 hover:text-stone-950 font-bold px-4 py-2.5 rounded-lg text-xs transition-all"
                    >
                      Print View
                    </button>
                  </div>
                </div>

                <div className="glass-panel p-4 border border-stone-200 flex flex-wrap gap-3 items-center text-xs">
                  <span className="font-bold text-stone-800 uppercase tracking-wider">Layout Controls:</span>
                  <button
                    onClick={handleAddClassRow}
                    className="bg-white border border-stone-300 hover:border-amber-500 text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded transition-all font-semibold"
                  >
                    + Add Class Row
                  </button>
                  <button
                    onClick={handleAddTimeSlot}
                    className="bg-white border border-stone-300 hover:border-amber-500 text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded transition-all font-semibold"
                  >
                    + Add Time Slot Column
                  </button>
                </div>

                {/* PREVIEW CONTAINER - FULL REAL WYSIWYG A4 PAGE */}
                <div className="flex justify-center overflow-x-auto py-6 bg-stone-200 border border-stone-300 rounded-xl shadow-inner">
                  <div className="shadow-2xl border border-stone-300 bg-white p-1">
                    {/* Printable Canvas Ref */}
                    <div
                      id="timetable-export"
                      ref={previewRef}
                      className="a4-page"
                    >
                      {/* Compact Header: Logo & Titles */}
                      <div className="header">
                        {/* Logo Top Left */}
                        <div className="flex items-center justify-start">
                          {logo ? (
                            <img src={logo} alt="Crest Logo" className="logo" />
                          ) : (
                            <div className="w-14 h-14 border border-stone-950 rounded-full flex flex-col items-center justify-center text-center p-0.5 bg-white">
                              <div className="border border-stone-950 rounded-full w-full h-full flex flex-col items-center justify-center">
                                <span className="text-4xs font-bold leading-none">LEAPS</span>
                                <span className="text-5xs font-serif leading-none mt-0.5">ACADEMY</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Centered Main Title Heading Area */}
                        <div className="heading-area">
                          <h1>
                            <input
                              type="text"
                              value={academyName}
                              onChange={(e) => {
                                setAcademyName(e.target.value);
                                saveData({ academyName: e.target.value });
                              }}
                              className="bg-transparent text-center border-none focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif font-black uppercase text-stone-950 w-full"
                            />
                          </h1>
                          <h2>
                            <input
                              type="text"
                              value={headingText}
                              onChange={(e) => {
                                setHeadingText(e.target.value);
                                saveData({ headingText: e.target.value });
                              }}
                              className="bg-transparent text-center border-none focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif font-bold uppercase text-stone-850 w-full"
                            />
                          </h2>
                        </div>

                        <div className="w-20"></div>
                      </div>

                      {/* Central Timetable Data Grid */}
                      <div className="content-area">
                        <div className="timetable-wrapper">
                          <table className="timetable-table">
                            <thead>
                              <tr>
                                <th className="class-col">Class / Time</th>
                                {timeSlots.map((slot, index) => (
                                  <th
                                    key={index}
                                    className="relative group"
                                  >
                                    <input
                                      type="text"
                                      value={slot}
                                      onChange={(e) => handleSlotNameChange(index, e.target.value)}
                                      className="bg-transparent text-center border-none focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold w-full"
                                    />
                                    <button
                                      onClick={() => handleRemoveTimeSlot(index)}
                                      className="absolute -top-1 -right-1 hidden group-hover:block bg-red-650 text-white w-4 h-4 rounded-full text-3xs font-extrabold no-print shadow"
                                      title="Remove Column"
                                    >
                                      ✕
                                    </button>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {classes.map((cls) => (
                                <tr key={cls.id}>
                                  <td className="class-col relative group">
                                    <input
                                      type="text"
                                      value={cls.name}
                                      onChange={(e) => handleClassNameChange(cls.id, e.target.value)}
                                      className="bg-transparent text-center font-black border-none focus:outline-none focus:ring-1 focus:ring-amber-500 w-full"
                                    />
                                    <button
                                      onClick={() => handleRemoveClassRow(cls.id)}
                                      className="absolute top-1 right-1 hidden group-hover:block text-red-650 font-bold text-xs no-print"
                                      title="Remove Row"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                  {timeSlots.map((slot, index) => {
                                    const cell = timetable[cls.id]?.[slot] || { subject: "-", teacher: "-", isTest: false };
                                    return (
                                      <td
                                        key={index}
                                        className="relative group"
                                      >
                                        {cell.isTest ? (
                                          <span className="test-cell select-none">TEST</span>
                                        ) : (
                                          <>
                                            <input
                                              type="text"
                                              value={cell.subject}
                                              onChange={(e) => handleCellEdit(cls.id, slot, "subject", e.target.value)}
                                              className="subject bg-transparent text-center border-none focus:outline-none focus:ring-1 focus:ring-amber-500 w-full p-0"
                                              placeholder="Subject"
                                            />
                                            <input
                                              type="text"
                                              value={cell.teacher}
                                              onChange={(e) => handleCellEdit(cls.id, slot, "teacher", e.target.value)}
                                              className="teacher bg-transparent text-center border-none focus:outline-none focus:ring-1 focus:ring-amber-500 w-full p-0"
                                              placeholder="Teacher"
                                            />
                                          </>
                                        )}

                                        {/* Action Hover Badges */}
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5 transition-all bg-white/95 px-0.5 py-0.5 rounded shadow border border-stone-200 no-print">
                                          <button
                                            onClick={() => toggleTestCell(cls.id, slot)}
                                            className={`px-0.5 rounded text-3xs font-bold ${
                                              cell.isTest
                                                ? "bg-stone-200 text-stone-850"
                                                : "bg-amber-500 text-stone-950"
                                            }`}
                                            title="Toggle TEST"
                                          >
                                            T
                                          </button>
                                          <button
                                            onClick={() => handleClearCell(cls.id, slot)}
                                            className="bg-red-500 hover:bg-red-650 text-white px-0.5 rounded text-3xs font-bold"
                                            title="Clear Cell"
                                          >
                                            C
                                          </button>
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Absolute Footer */}
                      <div className="footer">
                        <div>
                          <input
                            type="text"
                            value={footerText}
                            onChange={(e) => {
                              setFooterText(e.target.value);
                              saveData({ footerText: e.target.value });
                            }}
                            className="bg-transparent font-bold border-none focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-950 w-48"
                            placeholder="LA25092025 V 1.1"
                          />
                        </div>
                        <div className="italic text-stone-950">LEAPS Academy Time Table Maker v1.1</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* FOOTER BAR */}
      <footer className="bg-stone-900 text-stone-500 py-6 border-t border-stone-850 text-center text-xs no-print">
        <p>© 2026 LEAPS Academy Time Table Maker. Built with Next.js, Tailwind CSS and jsPDF.</p>
      </footer>
    </div>
  );
}
