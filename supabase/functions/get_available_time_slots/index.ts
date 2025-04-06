
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    // Extract parameters from request
    const { date, dukkanId, personelId } = await req.json();
    
    if (!date) {
      return new Response(
        JSON.stringify({ error: "Date is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Define time slots (30 minute intervals from 9:00 to 19:00)
    const allTimeSlots = [];
    for (let hour = 9; hour < 19; hour++) {
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    // Get existing appointments for the selected date
    let query = supabase
      .from('randevular')
      .select('saat, durum')
      .eq('tarih', date);
      
    if (dukkanId) {
      query = query.eq('dukkan_id', dukkanId);
    }
    
    if (personelId) {
      query = query.eq('personel_id', personelId);
    }
    
    const { data: appointments, error } = await query;
    
    if (error) {
      console.error("Error fetching appointments:", error);
      return new Response(
        JSON.stringify({ error: "Error fetching appointments", details: error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Filter out time slots that already have active appointments
    const bookedSlots = appointments
      .filter(app => app.durum !== "iptal_edildi")
      .map(app => app.saat.substring(0, 5)); // Get just HH:MM
      
    // Return available time slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    
    // Get current time
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // If the date is today, filter out past time slots
    if (date === today) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      return new Response(
        JSON.stringify(
          availableSlots.filter(slot => {
            const [slotHour, slotMinute] = slot.split(':').map(Number);
            return slotHour > currentHour || 
                  (slotHour === currentHour && slotMinute > currentMinute);
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify(availableSlots),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
