import React, { useEffect, useState, useRef } from 'react';
import { 
  Modal, Box, Typography, CircularProgress, CardContent, 
  TextField, IconButton, InputAdornment, Paper, Divider,
  useTheme
} from '@mui/material';
import { IoMdSend } from 'react-icons/io';
import { green, blue, grey, purple, teal } from '@mui/material/colors';

// Enhanced modal styling - updated with green theme to match sidebar
const style = {
    position: 'absolute',
    top: '50%',
    left: '57.6%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '72%',
    height: '80vh',
    maxHeight: '95vh',
    bgcolor: '#121212', // Matching sidebar background
    color: '#FFFFFF',
    boxShadow: '0 8px 32px rgba(0, 128, 0, 0.2)', // Green shadow
    borderRadius: 3,
    overflowY: 'auto',
    border: `2px solid ${green[700]}`, // Updated to green from blue
    backgroundImage: 'linear-gradient(to bottom, #1a1a1a, #0d0d0d)', // Same gradient as sidebar
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '1px',
      height: '100%',
      background: `linear-gradient(to bottom, transparent, ${green[900]}, transparent)`,
      opacity: 0.6,
    }
};

// Animation keyframes
const pulseAnimation = {
    '@keyframes pulse': {
        '0%': { opacity: 0.6 },
        '50%': { opacity: 1 },
        '100%': { opacity: 0.6 }
    }
};

const StockAnalysisModal = ({ open, handleClose, result }) => {
    const theme = useTheme();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [streamedText, setStreamedText] = useState('');
    const [streamComplete, setStreamComplete] = useState(false);
    const textToStream = useRef('');
    const streamIntervalRef = useRef(null);

    // Streaming function (keeping your implementation)
    const simulateStreaming = (text) => {
        if (!text) return;
        
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
        }
        
        setStreamedText('');
        setStreamComplete(false);
        
        let fixedText = text;
        
        if (fixedText.match(/[^<]span style="color:/g)) {
            fixedText = fixedText.replace(/([^<])(span style="color:)/g, '$1<$2');
        }
        
        if (fixedText.startsWith('span style="color:')) {
            fixedText = '<' + fixedText;
        }
        
        const openSpans = (fixedText.match(/<span/g) || []).length;
        const closeSpans = (fixedText.match(/<\/span>/g) || []).length;
        if (openSpans > closeSpans) {
            for (let i = 0; i < openSpans - closeSpans; i++) {
                fixedText += '</span>';
            }
        }
        
        textToStream.current = fixedText;
        let charIndex = 0;
        
        streamIntervalRef.current = setInterval(() => {
            if (charIndex < textToStream.current.length) {
                setStreamedText(prev => prev + textToStream.current.charAt(charIndex));
                charIndex++;
            } else {
                clearInterval(streamIntervalRef.current);
                setStreamComplete(true);
            }
        }, 10);
    };

    useEffect(() => {
        if (open) {
            setLoading(true);
            setStreamedText('');
            setStreamComplete(false);
        }
        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, [open]);

    useEffect(() => {
        if (result && typeof result === 'string') {
            setLoading(false);
            simulateStreaming(result);
        } else if (result && result.analysis) {
            setLoading(false);
            simulateStreaming(result.analysis);
        } else if (result) {
            setLoading(false);
            const combinedText = [
                `Decision: ${result.decision || ''}`,
                `Technical Analysis: ${result.technical_analysis || ''}`,
                `Fundamental Analysis: ${result.fundamental_analysis || ''}`
            ].join('\n\n');
            simulateStreaming(combinedText);
        }
    }, [result]);

    const handleSend = () => {
        if (!input.trim()) return;
        console.log('User asked:', input);
        setInput('');
    };

    return (
        <Modal 
            open={open} 
            onClose={handleClose}
            sx={{ backdropFilter: 'blur(5px)' }}
        >
            <Box sx={style}>
                {/* Header - Updated to match sidebar green/teal theme */}
                <Box 
                    sx={{ 
                        background: `linear-gradient(90deg, ${teal[700]}, ${green[700]})`, // Changed from blue/purple to teal/green
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        p: 2,
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: 'white', 
                            fontWeight: 600, 
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            letterSpacing: 1
                        }}
                    >
                        AI Stock Analysis
                    </Typography>
                </Box>

                {/* Content Area */}
                <Box sx={{ mb: 2, px: { xs: 2, sm: 4 }, maxHeight: '65vh', overflowY: 'auto' }}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            bgcolor: 'rgba(20, 30, 20, 0.6)', // Adjusted to have a slight green tint
                            color: 'white',
                            borderRadius: 2,
                            p: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            border: `1px solid ${green[900]}`, // Added green border to match sidebar
                        }}
                    >
                        {loading ? (
                            <Box 
                                display="flex" 
                                flexDirection="column" 
                                alignItems="center" 
                                justifyContent="center" 
                                py={8}
                                sx={{ ...pulseAnimation }}
                            >
                                <CircularProgress 
                                    size={60}
                                    sx={{ 
                                        color: green[400],
                                        animation: 'pulse 2s infinite',
                                        '& .MuiCircularProgress-circle': {
                                            strokeLinecap: 'round',
                                        }
                                    }} 
                                />
                                <Typography 
                                    mt={3} 
                                    fontSize="14pt" 
                                    fontWeight="bold" 
                                    sx={{ 
                                        animation: 'pulse 2s infinite',
                                        color: green[300],
                                        textShadow: '0 0 10px rgba(0,255,0,0.2)'
                                    }}
                                >
                                    Analyzing market data...
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Box 
                                    sx={{ 
                                        fontSize: '15px',
                                        lineHeight: 1.7,
                                        letterSpacing: 0.3,
                                        '& h3': { 
                                            marginTop: '20px', 
                                            marginBottom: '12px', 
                                            fontSize: '18px',
                                            color: teal[300], // Kept teal for headings, matches sidebar
                                            fontWeight: 600
                                        },
                                        '& p': { 
                                            marginBottom: '14px',
                                            color: grey[100]
                                        },
                                        '& a': { 
                                            color: green[400], // Changed from blue to green
                                            textDecoration: 'none',
                                            transition: 'all 0.2s ease'
                                        },
                                        '& a:hover': { 
                                            textDecoration: 'underline',
                                            color: teal[300], // Changed from blue to teal
                                            transform: 'translateX(2px)', // Added subtle movement on hover
                                        },
                                        '& img': { 
                                            maxHeight: '16px', 
                                            verticalAlign: 'middle',
                                            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
                                        },
                                        '& span[style*="color: #22c55e"]': { 
                                            color: `${green[400]} !important`,
                                            textShadow: '0 0 10px rgba(0,255,0,0.3)',
                                            fontWeight: '700 !important'
                                        },
                                        '& span[style*="color: #ef4444"]': { 
                                            color: '#ff5252 !important',
                                            textShadow: '0 0 10px rgba(255,0,0,0.3)',
                                            fontWeight: '700 !important'
                                        },
                                        '& .sources-container, & div[style*="margin-top: 20px"]': {
                                            marginTop: '25px',
                                            padding: '15px',
                                            background: 'rgba(0, 7, 0, 0.92)', // Green tinted background
                                            borderRadius: '8px',
                                            border: `1px solid ${green[900]}` // Green border
                                        },
                                        '& a div': { // Target each source card
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-3px)',
                                                boxShadow: `0 6px 10px rgba(0,128,0,0.2)` // Green shadow
                                            }
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: "<"+ streamedText }}
                                />
                                
                                {streamComplete && (
                                    <>
                                        <Divider sx={{ my: 3, bgcolor: green[900], opacity: 0.7 }} /> {/* Changed to green divider */}
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: grey[500], 
                                                fontStyle: 'italic',
                                                fontSize: '11px',
                                                display: 'block',
                                                background: 'rgba(0,30,0,0.2)', // Green tinted background
                                                p: 1.5,
                                                borderRadius: 1,
                                                border: `1px solid ${green[900]}` // Changed to green border
                                            }}
                                        >
                                            Disclaimer: The past performance of a security, an industry, a sector, a market, a financial product, a trading strategy or the individual trade does not guarantee any future results or returns. As an investor, you yourself bear the full responsibility for your individual investment decisions.
                                        </Typography>
                                    </>
                                )}
                            </>
                        )}
                    </Paper>
                </Box>

                {/* Input Area - updated to match sidebar green theme */}
                {streamComplete && (
                    <Box 
                        display="flex" 
                        alignItems="center" 
                        gap={1} 
                        px={4}
                        position="sticky"
                        bottom={10}
                        mt={3}
                    >
                        <TextField
                            fullWidth
                            placeholder="Ask a follow-up question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            size="small"
                            variant="outlined"
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderRadius: '10px', // Matching sidebar button radius
                                    paddingRight: '1.3em',
                                    color: 'white',
                                    backgroundColor: 'rgba(0, 30, 0, 0.2)', // Green tinted background
                                    backdropFilter: 'blur(4px)',
                                    height: '48px',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: grey[800],
                                    transition: 'all 0.2s'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: blue[700],
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: green[700],
                                    borderWidth: 2
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: grey[500],
                                    opacity: 1,
                                    fontStyle: 'italic'
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            onClick={handleSend} 
                                            edge="end" 
                                            sx={{ 
                                                p: 1.2, 
                                                color: green[400],
                                                bgcolor: 'rgba(0,0,0,0.2)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(0,100,0,0.3)',
                                                },
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <IoMdSend />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default StockAnalysisModal;
