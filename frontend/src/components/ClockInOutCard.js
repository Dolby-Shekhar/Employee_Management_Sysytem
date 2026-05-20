import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
  Alert,
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';



/**
 * Basic clock-in/out card.
 * - Uses browser geolocation for location.
 * - Calls:
 *    POST /api/attendance/clock-in
 *    POST /api/attendance/clock-out
 * - Calls onDone() after success.
 */
const ClockInOutCard = ({ axiosInstance, onDone, EmptyStateComponent }) => {
  // EmptyStateComponent kept for backward-compat; UI uses Alert/EmptyState from parent.

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [error, setError] = useState('');

  // Optional: if you want distance checking, set these via env or hardcode.
  // For now: accept any location.
  const requiredDistanceKm = useMemo(() => null, []);

  const fetchTodayStatus = async () => {
    setStatusLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/attendance/today');
      setTodayStatus(res.data || res);
    } catch (e) {
      // don’t hard fail UI
      setTodayStatus(null);
      setError(e?.response?.data?.message || 'Failed to load today status');
    } finally {
      setStatusLoading(false);
    }
  };

  const getLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser'));
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          resolve({
            lat: latitude,
            lng: longitude,
            accuracy,
          });
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  const doClockIn = async (location) => {
    const res = await axiosInstance.post('/attendance/clock-in', {
      location: {
        location: undefined,
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
      },
    });
    return res;
  };

  const doClockOut = async (location) => {
    const res = await axiosInstance.post('/attendance/clock-out', {
      location: {
        location: undefined,
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
      },
    });
    return res;
  };

  // Load status on mount
  React.useEffect(() => {
    fetchTodayStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClockIn = async () => {
    setLoading(true);
    setError('');
    try {
      const location = await getLocation();

      // Optional distance check
      if (requiredDistanceKm) {
        // if you had a fixed office coordinate, compare it here.
        // For now this is intentionally unused.
        // const dist = haversineKm(officeLat, officeLng, location.lat, location.lng);
        // if (dist > requiredDistanceKm) throw new Error('You are too far from the office');
      }

      await doClockIn(location);
      await fetchTodayStatus();
      onDone?.();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Clock in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    setError('');
    try {
      const location = await getLocation();

      if (requiredDistanceKm) {
        // Distance check hook (see handleClockIn)
      }

      await doClockOut(location);
      await fetchTodayStatus();
      onDone?.();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Clock out failed');
    } finally {
      setLoading(false);
    }
  };

  const clockInTime = todayStatus?.clockIn?.time ? new Date(todayStatus.clockIn.time) : null;
  const clockOutTime = todayStatus?.clockOut?.time ? new Date(todayStatus.clockOut.time) : null;

  const hasClockedIn = !!todayStatus?.clockIn?.time;
  const hasClockedOut = !!todayStatus?.clockOut?.time;

  if (statusLoading && !todayStatus) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <CardContent sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'white',
            }}
          >
            <AccessTime />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Clock In / Out</Typography>
            <Typography color="text.secondary" variant="body2">Today</Typography>
          </Box>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Clock In</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
              {clockInTime ? clockInTime.toLocaleTimeString() : 'Not clocked in'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {todayStatus?.clockIn?.address ? todayStatus.clockIn.address : ''}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">Clock Out</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
              {clockOutTime ? clockOutTime.toLocaleTimeString() : 'Not clocked out'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {todayStatus?.clockOut?.address ? todayStatus.clockOut.address : ''}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClockIn}
            disabled={loading || hasClockedIn || hasClockedOut}
          >
            {loading && !hasClockedIn ? <CircularProgress size={22} color="inherit" /> : 'Clock In'}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={handleClockOut}
            disabled={loading || !hasClockedIn || hasClockedOut}
          >
            {loading && hasClockedIn && !hasClockedOut ? <CircularProgress size={22} color="inherit" /> : 'Clock Out'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClockInOutCard;

