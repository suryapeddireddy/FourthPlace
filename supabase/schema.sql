CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS public.micro_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id text,
  host_name text NOT NULL,
  host_role text NOT NULL,
  host_company text NOT NULL,
  topic_title text NOT NULL,
  category text NOT NULL,
  max_seats int DEFAULT 4,
  reserved_seats int DEFAULT 0,
  seat_price_inr int NOT NULL,
  scheduled_at timestamptz NOT NULL,
  venue_name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  location geography(Point, 4326),
  topics_covered text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seat_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES public.micro_tables(id) ON DELETE CASCADE,
  user_id text,
  attendee_name text NOT NULL,
  attendee_goal text,
  status text DEFAULT 'confirmed',
  booked_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.book_micro_table_seat(
  p_table_id uuid,
  p_attendee_name text,
  p_attendee_goal text
)
RETURNS public.seat_bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_updated_table_id uuid;
  v_max_seats int;
  v_reserved_seats int;
  v_booking public.seat_bookings%ROWTYPE;
BEGIN
  UPDATE public.micro_tables AS mt
  SET reserved_seats = mt.reserved_seats + 1
  WHERE mt.id = p_table_id
    AND mt.reserved_seats < mt.max_seats
  RETURNING mt.id INTO v_updated_table_id;

  IF NOT FOUND THEN
    SELECT mt.max_seats, mt.reserved_seats
    INTO v_max_seats, v_reserved_seats
    FROM public.micro_tables AS mt
    WHERE mt.id = p_table_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Micro table % does not exist', p_table_id
        USING ERRCODE = 'P0002';
    END IF;

    RAISE EXCEPTION 'Micro table % is full (%/% seats reserved)',
      p_table_id, v_reserved_seats, v_max_seats
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.seat_bookings (table_id, attendee_name, attendee_goal)
  VALUES (v_updated_table_id, p_attendee_name, p_attendee_goal)
  RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$;

ALTER TABLE public.micro_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public reads of micro tables" ON public.micro_tables;
CREATE POLICY "Allow public reads of micro tables"
  ON public.micro_tables
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow public inserts of micro tables" ON public.micro_tables;
CREATE POLICY "Allow public inserts of micro tables"
  ON public.micro_tables
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public reads of seat bookings" ON public.seat_bookings;
CREATE POLICY "Allow public reads of seat bookings"
  ON public.seat_bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow public inserts of seat bookings" ON public.seat_bookings;
CREATE POLICY "Allow public inserts of seat bookings"
  ON public.seat_bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT SELECT, INSERT ON public.micro_tables TO anon, authenticated;
GRANT SELECT, INSERT ON public.seat_bookings TO anon, authenticated;

REVOKE ALL ON FUNCTION public.book_micro_table_seat(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.book_micro_table_seat(uuid, text, text)
  TO anon, authenticated;
