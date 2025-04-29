import React, { useEffect, useState, useRef } from 'react';
import { 
  Modal, Box, Typography, CircularProgress, CardContent, 
  TextField, IconButton, InputAdornment, Paper, Divider,
  useTheme, useMediaQuery
} from '@mui/material';
import { IoMdSend } from 'react-icons/io';
import { FaTimes } from 'react-icons/fa';
import { green, blue, grey, purple, teal } from '@mui/material/colors';

// Enhanced modal styling - updated with green theme to match sidebar
const StockAnalysisModal = ({ open, handleClose, result }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [streamedText, setStreamedText] = useState('');
    const [streamComplete, setStreamComplete] = useState(false);
    const textToStream = useRef('');
    const streamIntervalRef = useRef(null);
    const contentRef = useRef(null);
    
    // Style object with mobile responsiveness
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '90%' : '80%',
        maxWidth: isMobile ? '100%' : '72%',
        height: isMobile ? '90vh' : '80vh',
        maxHeight: '95vh',
        bgcolor: '#121212',
        color: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0, 128, 0, 0.2)',
        borderRadius: isMobile ? 2 : 3,
        overflowY: 'auto',
        border: `2px solid ${green[700]}`,
        backgroundImage: 'linear-gradient(to bottom, #1a1a1a, #0d0d0d)',
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

    // Auto-scroll to bottom as content is streamed
    useEffect(() => {
        if (contentRef.current && streamedText) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [streamedText]);

    // Streaming function
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
                {/* Header with Close Button */}
                <Box 
                    sx={{ 
                        background: `linear-gradient(90deg, ${teal[700]}, ${green[700]})`,
                        borderTopLeftRadius: isMobile ? 8 : 10,
                        borderTopRightRadius: isMobile ? 8 : 10,
                        p: 2,
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                    }}
                >
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: 'white', 
                            fontWeight: 600, 
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            letterSpacing: 1,
                            fontSize: isMobile ? '1.2rem' : '1.5rem'
                        }}
                    >
                        AI Stock Analysis
                    </Typography>
                    
                    {/* Close Button */}
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.2)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.1)',
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaTimes />
                    </IconButton>
                </Box>

                {/* Content Area with Auto-scroll */}
                <Box 
                    ref={contentRef}
                    sx={{ 
                        mb: 2, 
                        px: { xs: 2, sm: 4 }, 
                        maxHeight: isMobile ? '65vh' : '62vh', 
                        overflowY: 'auto',
                        scrollBehavior: 'smooth'
                    }}
                >
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            bgcolor: 'rgba(20, 30, 20, 0.6)',
                            color: 'white',
                            borderRadius: 2,
                            p: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            border: `1px solid ${green[900]}`,
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
                                            color: teal[300],
                                            fontWeight: 600
                                        },
                                        '& p': { 
                                            marginBottom: '14px',
                                            color: grey[100]
                                        },
                                        '& a': { 
                                            color: green[400],
                                            textDecoration: 'none',
                                            transition: 'all 0.2s ease'
                                        },
                                        '& a:hover': { 
                                            textDecoration: 'underline',
                                            color: teal[300],
                                            transform: 'translateX(2px)',
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
                                        // Removed separate box for news section
                                        '& .sources-container, & div[style*="margin-top: 20px"]': {
                                            marginTop: '25px'
                                        },
                                        '& a div': { // Target each source card
                                            transition: 'transform 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-3px)'
                                            }
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: "<"+ streamedText }}
                                />
                                
                                {streamComplete && (
                                    <>
                                        <Divider sx={{ my: 3, bgcolor: green[900], opacity: 0.7 }} />
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: grey[500], 
                                                fontStyle: 'italic',
                                                fontSize: '11px',
                                                display: 'block',
                                                background: 'rgba(0,30,0,0.2)',
                                                p: 1.5,
                                                borderRadius: 1,
                                                border: `1px solid ${green[900]}`
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

                {/* Input Area */}
                {streamComplete && (
                    <Box 
                        display="flex" 
                        alignItems="center" 
                        gap={1} 
                        px={isMobile ? 2 : 4}
                        position="sticky"
                        bottom={10}
                        mt={isMobile ? 2 : 3}
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
                                    borderRadius: '10px',
                                    paddingRight: '1.3em',
                                    color: 'white',
                                    backgroundColor: 'rgba(0, 30, 0, 0.2)',
                                    backdropFilter: 'blur(4px)',
                                    height: isMobile ? '44px' : '48px',
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
